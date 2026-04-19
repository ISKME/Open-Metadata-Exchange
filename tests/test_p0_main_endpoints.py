"""End-to-end-ish FastAPI route tests for the P0 fixes.

Asserts:

* ``/api/imls/v2/collections/browse/`` accepts and returns the ``page``
  query parameter (issue #3).
* ``/api/imls/v2/collections/{channel}/{_id}/resources`` accepts and
  returns ``page`` (issue #3).
* The CORS middleware honors :func:`server.config.get_allowed_origins`
  (issue #1).

Runs against FastAPI's in-process ``TestClient``. Business logic is
still mocked by patching ``server.utils`` collaborators; we're testing
the endpoint wiring here, not NNTP.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

import pytest
from fastapi.testclient import TestClient

from server.schemas import ChannelSummary, Post

if TYPE_CHECKING:
    pass


def _post(post_id: int = 1, channel: str = "ome.alpha") -> Post:
    return Post(
        id=post_id,
        channels=[channel],
        admin_contact="librarian@example.test",
        subject=f"Subject {post_id}",
        body="body",
        attachments=[],
        date=datetime(2026, 4, 19, tzinfo=UTC),
    )


class _FakePlugin:
    def __init__(self, slug: str) -> None:
        self.newsgroups = {slug: "desc"}
        self.site_name = "Site"
        self.librarian_contact = "librarian@example.test"
        self.logo = "/static/logo.svg"


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    """FastAPI TestClient with ``server.utils`` collaborators mocked.

    CORS env is set so ``get_cors_middleware_kwargs`` returns a valid
    config at app import time.
    """
    monkeypatch.setenv("OME_ENV", "dev")
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "https://ui.example.test")

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
    posts = [_post(i) for i in range(1, 6)]

    def _fake_get_channels() -> Any:
        yield from channels

    monkeypatch.setattr(utils, "get_channels", _fake_get_channels)
    monkeypatch.setattr(utils, "channel_summary", lambda s, *a, **k: summaries[s])
    monkeypatch.setattr(utils, "get_last_n_posts", lambda _slug, num: posts[:num])
    monkeypatch.setattr(utils, "site_plugin", _FakePlugin("ome.alpha"))

    from server.main import app

    return TestClient(app)


def test_browse_endpoint_accepts_page_query(client: TestClient) -> None:
    resp = client.get("/api/imls/v2/collections/browse/?page=4&per_page=10")
    assert resp.status_code == 200
    body = resp.json()
    assert body["collections"]["pagination"]["page"] == 4
    assert body["collections"]["pagination"]["count"] == 50  # real, not 124
    assert body["collections"]["pagination"]["perPage"] == 10


def test_browse_endpoint_defaults(client: TestClient) -> None:
    resp = client.get("/api/imls/v2/collections/browse/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["collections"]["pagination"]["page"] == 1


def test_channel_resources_endpoint_accepts_page(client: TestClient) -> None:
    resp = client.get(
        "/api/imls/v2/collections/ome.alpha/0/resources?page=2&per_page=10"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["resources"]["pagination"]["page"] == 2
    assert body["resources"]["pagination"]["count"] == 50


def test_cors_uses_configured_origin(client: TestClient) -> None:
    resp = client.options(
        "/api/imls/v2/collections/browse/",
        headers={
            "origin": "https://ui.example.test",
            "access-control-request-method": "GET",
        },
    )
    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == "https://ui.example.test"


def test_cors_rejects_unknown_origin(client: TestClient) -> None:
    resp = client.options(
        "/api/imls/v2/collections/browse/",
        headers={
            "origin": "https://evil.example.test",
            "access-control-request-method": "GET",
        },
    )
    # Starlette returns 400 when the origin isn't on the allow-list.
    # The important thing: no access-control-allow-origin echoed back.
    assert (
        resp.headers.get("access-control-allow-origin") != "https://evil.example.test"
    )
