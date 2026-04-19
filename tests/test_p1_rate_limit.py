"""Issue #5 — per-IP rate limiting on list/search endpoints.

Exercises the ``slowapi`` middleware wired into ``server.main``:

* The limit is configurable via ``OME_RATE_LIMIT`` (format: ``N/window``,
  e.g. ``"3/minute"``). Setting a very low limit makes the test fast.
* After the quota is exhausted for the origin IP, the next request
  returns HTTP 429.
* Under the default (unset) config the limit is permissive enough that
  normal test runs do not trip it.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import pytest
from fastapi.testclient import TestClient

from server.schemas import ChannelSummary, Post


class _FakePlugin:
    def __init__(self, slug: str) -> None:
        self.newsgroups = {slug: "desc"}
        self.site_name = "Site"
        self.librarian_contact = "librarian@example.test"
        self.logo = "/static/logo.svg"


def _post(post_id: int = 1) -> Post:
    return Post(
        id=post_id,
        channels=["ome.alpha"],
        admin_contact="librarian@example.test",
        subject=f"Subject {post_id}",
        body="body",
        attachments=[],
        date=datetime(2026, 4, 19, tzinfo=UTC),
    )


def _stub_utils(monkeypatch: pytest.MonkeyPatch) -> None:
    import server.utils as utils

    channels = [("ome.alpha", "Alpha", _FakePlugin("ome.alpha"))]
    summaries = {
        "ome.alpha": ChannelSummary(
            name="ome.alpha",
            estimated_total_articles=50,
            first_article=1,
            last_article=50,
        ),
    }
    posts = [_post(i) for i in range(1, 4)]

    def _fake_get_channels() -> Any:
        yield from channels

    monkeypatch.setattr(utils, "get_channels", _fake_get_channels)
    monkeypatch.setattr(utils, "channel_summary", lambda s, *a, **k: summaries[s])
    monkeypatch.setattr(utils, "get_last_n_posts", lambda _slug, num: posts[:num])
    monkeypatch.setattr(utils, "site_plugin", _FakePlugin("ome.alpha"))


def _fresh_app(monkeypatch: pytest.MonkeyPatch) -> Any:
    """Re-import ``server.main`` so its module-level limiter re-reads env."""
    import importlib

    import server.main

    return importlib.reload(server.main)


def test_exceeding_rate_limit_returns_429(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OME_ENV", "dev")
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "https://ui.example.test")
    # Set a low limit so the test is fast and deterministic.
    monkeypatch.setenv("OME_RATE_LIMIT", "3/minute")
    _stub_utils(monkeypatch)

    main = _fresh_app(monkeypatch)
    client = TestClient(main.app)

    # First 3 within limit.
    for _ in range(3):
        resp = client.get("/api/imls/v2/collections/browse/")
        assert resp.status_code == 200, resp.text

    # 4th must be throttled.
    resp = client.get("/api/imls/v2/collections/browse/")
    assert resp.status_code == 429


def test_rate_limit_permissive_by_default(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Without ``OME_RATE_LIMIT`` set, routine test traffic should not 429."""
    monkeypatch.setenv("OME_ENV", "dev")
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "https://ui.example.test")
    monkeypatch.delenv("OME_RATE_LIMIT", raising=False)
    _stub_utils(monkeypatch)

    main = _fresh_app(monkeypatch)
    client = TestClient(main.app)

    for _ in range(5):
        resp = client.get("/api/imls/v2/collections/browse/")
        assert resp.status_code == 200, resp.text
