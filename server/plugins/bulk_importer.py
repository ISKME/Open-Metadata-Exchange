"""Shared bulk-import primitives (issue #10).

Every plugin used to implement its own sync ``httpx.Client`` loop with
ad-hoc retry. These helpers give new and refactored plugins a common
retry/concurrency contract:

* :func:`fetch_with_retry` — retry on 5xx and network errors with
  exponential backoff; treat 4xx as permanent and raise immediately so
  callers can distinguish typos or auth failures from flaky upstreams.
* :func:`bounded_gather` — concurrency-capped ``asyncio.gather`` so a
  single bulk job cannot saturate a site or blow its rate limits.
* :class:`RetriableHTTPError` / :class:`PermanentHTTPError` — the two
  terminal outcomes callers need to branch on.

Intentionally minimal. Plugins that need more (pagination, checkpoint
files, body transforms) can compose these primitives rather than
re-inventing the retry loop.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Iterable
from typing import Any, TypeVar

import httpx

logger = logging.getLogger(__name__)

T = TypeVar("T")

# HTTP status codes worth retrying. 408 (request timeout) and 429 (rate
# limited) join the usual 5xx suspects — a polite client backs off on
# both.
_RETRIABLE_STATUSES = frozenset({408, 429, 500, 502, 503, 504})


class BulkImporterError(RuntimeError):
    """Base error raised by the bulk importer primitives."""


class RetriableHTTPError(BulkImporterError):
    """Raised when retries are exhausted on a retriable status."""


class PermanentHTTPError(BulkImporterError):
    """Raised immediately on a non-retriable (typically 4xx) response."""


async def fetch_with_retry(
    client: httpx.AsyncClient,
    url: str,
    *,
    max_retries: int = 3,
    backoff_base: float = 0.5,
    method: str = "GET",
    **request_kwargs: Any,
) -> httpx.Response:
    """Fetch ``url`` with exponential backoff on retriable failures.

    ``max_retries`` counts retries — so the total attempt budget is
    ``max_retries + 1``. ``backoff_base`` is the first-retry delay in
    seconds; subsequent retries double it. Pass ``backoff_base=0`` in
    tests to avoid real sleeps.
    """
    last_exc: Exception | None = None

    for attempt in range(max_retries + 1):
        try:
            resp = await client.request(method, url, **request_kwargs)
        except httpx.TransportError as exc:
            # Network-layer error (connection refused, DNS, TLS). These
            # are almost always worth retrying.
            last_exc = exc
            logger.warning(
                "Bulk import transport error for %s (attempt %d): %s",
                url,
                attempt + 1,
                exc,
            )
        else:
            if resp.status_code < 400:
                return resp
            if resp.status_code in _RETRIABLE_STATUSES:
                last_exc = RetriableHTTPError(
                    f"{url} returned retriable status {resp.status_code}"
                )
                logger.warning(
                    "Bulk import %s returned %d (attempt %d)",
                    url,
                    resp.status_code,
                    attempt + 1,
                )
            else:
                # 4xx that is not 408/429 — permanent failure.
                raise PermanentHTTPError(
                    f"{url} returned permanent status {resp.status_code}"
                )

        if attempt < max_retries:
            await asyncio.sleep(backoff_base * (2**attempt))

    raise RetriableHTTPError(
        f"{url} failed after {max_retries + 1} attempts"
    ) from last_exc


async def bounded_gather(
    awaitables: Iterable[Awaitable[T]],
    *,
    limit: int,
) -> list[T]:
    """Run ``awaitables`` concurrently, capped at ``limit`` at a time.

    Preserves the same exception-propagation semantics as
    :func:`asyncio.gather`: the first exception is raised and remaining
    tasks are cancelled.
    """
    if limit < 1:
        msg = f"limit must be >= 1, got {limit}"
        raise ValueError(msg)

    sem = asyncio.Semaphore(limit)

    async def _run(coro: Awaitable[T]) -> T:
        async with sem:
            return await coro

    return await asyncio.gather(*(_run(a) for a in awaitables))
