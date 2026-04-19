"""Issue #10 — shared bulk-import helpers.

Every plugin's ``bulk_import.py`` had its own sync ``httpx.Client`` loop
with no concurrency and inconsistent retry logic. This PR delivers the
reusable primitives; refactoring individual plugins to use them is a
follow-up task.

Primitives (``server/plugins/bulk_importer.py``):

* :func:`fetch_with_retry` — fetch a URL with exponential backoff,
  retry on 5xx + network errors, surface 4xx as permanent failure.
* :func:`bounded_gather` — run awaitables with a concurrency cap
  (``asyncio.Semaphore``).
* :class:`RetriableHTTPError` — retriable-vs-permanent distinction.
"""

from __future__ import annotations

import asyncio
import pytest
import httpx

from server.plugins.bulk_importer import (
    RetriableHTTPError,
    PermanentHTTPError,
    bounded_gather,
    fetch_with_retry,
)


# ---------- fetch_with_retry ----------


@pytest.mark.asyncio
async def test_fetch_returns_successful_response() -> None:
    def handler(_req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text="ok")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as c:
        resp = await fetch_with_retry(c, "https://example.test/x")
    assert resp.status_code == 200
    assert resp.text == "ok"


@pytest.mark.asyncio
async def test_fetch_retries_on_5xx_then_succeeds() -> None:
    attempts = {"n": 0}

    def handler(_req: httpx.Request) -> httpx.Response:
        attempts["n"] += 1
        if attempts["n"] < 3:
            return httpx.Response(503, text="overloaded")
        return httpx.Response(200, text="ok")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as c:
        resp = await fetch_with_retry(
            c,
            "https://example.test/x",
            max_retries=5,
            backoff_base=0.0,  # no real sleep in tests
        )
    assert resp.status_code == 200
    assert attempts["n"] == 3


@pytest.mark.asyncio
async def test_fetch_raises_permanent_on_4xx_without_retry() -> None:
    attempts = {"n": 0}

    def handler(_req: httpx.Request) -> httpx.Response:
        attempts["n"] += 1
        return httpx.Response(404, text="not found")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as c:
        with pytest.raises(PermanentHTTPError):
            await fetch_with_retry(
                c,
                "https://example.test/x",
                max_retries=5,
                backoff_base=0.0,
            )
    assert attempts["n"] == 1, "4xx must NOT be retried"


@pytest.mark.asyncio
async def test_fetch_raises_retriable_after_exhausting_retries() -> None:
    attempts = {"n": 0}

    def handler(_req: httpx.Request) -> httpx.Response:
        attempts["n"] += 1
        return httpx.Response(503, text="still overloaded")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as c:
        with pytest.raises(RetriableHTTPError):
            await fetch_with_retry(
                c,
                "https://example.test/x",
                max_retries=2,
                backoff_base=0.0,
            )
    # max_retries=2 means 3 total tries.
    assert attempts["n"] == 3


@pytest.mark.asyncio
async def test_fetch_retries_on_network_error() -> None:
    attempts = {"n": 0}

    def handler(req: httpx.Request) -> httpx.Response:
        attempts["n"] += 1
        if attempts["n"] < 2:
            raise httpx.ConnectError("boom", request=req)
        return httpx.Response(200, text="ok")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as c:
        resp = await fetch_with_retry(
            c,
            "https://example.test/x",
            max_retries=3,
            backoff_base=0.0,
        )
    assert resp.status_code == 200
    assert attempts["n"] == 2


# ---------- bounded_gather ----------


@pytest.mark.asyncio
async def test_bounded_gather_respects_concurrency_cap() -> None:
    active = {"now": 0, "peak": 0}

    async def work(i: int) -> int:
        active["now"] += 1
        active["peak"] = max(active["peak"], active["now"])
        # Yield to the event loop so other tasks can run.
        await asyncio.sleep(0)
        active["now"] -= 1
        return i

    results = await bounded_gather(
        (work(i) for i in range(10)),
        limit=3,
    )
    assert sorted(results) == list(range(10))
    assert active["peak"] <= 3


@pytest.mark.asyncio
async def test_bounded_gather_propagates_exceptions() -> None:
    async def boom() -> None:
        raise RuntimeError("kaboom")

    with pytest.raises(RuntimeError, match="kaboom"):
        await bounded_gather([boom()], limit=2)
