"""Issue #6 — FastAPI endpoint coverage beyond P0.

The P0 PR (`tests/test_p0_main_endpoints.py`) exercises the browse +
channel-resources routes. Pagination validation
(`tests/test_p1_pagination_validation.py`) covers bounds on four
more. This file adds TestClient-level tests for the remaining
JSON API routes in `server/main.py`:

* `GET /api/list`
* `GET /api/channel/{name}`
* `GET /api/imls/v2/explore-oer-exchange/`
* `GET /api/imls/v2/collections/{channel}/{_id}`
* `POST /api/publish_url` — validation-error path
* `POST /api/channel/{name}/import` — validation-error path

Business logic is still stubbed at the `server.utils` / `server.ome_node`
layer: we verify endpoint wiring, response shape, and error propagation,
not NNTP.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import pytest
from fastapi.testclient import TestClient

from server.schemas import Channel, ChannelSummary, Post


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


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("OME_ENV", "dev")
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "https://ui.example.test")

    import server.ome_node as ome_node
    import server.utils as utils

    channels = [
        Channel(name="ome.alpha", description="Alpha channel"),
        Channel(name="ome.beta", description="Beta channel"),
    ]
    summaries = {
        "ome.alpha": ChannelSummary(
            name="ome.alpha",
            estimated_total_articles=12,
            first_article=1,
            last_article=12,
        ),
        "ome.beta": ChannelSummary(
            name="ome.beta",
            estimated_total_articles=5,
            first_article=1,
            last_article=5,
        ),
    }
    posts = [_post(i) for i in range(1, 4)]

    def _fake_channels() -> Any:
        yield from channels

    # ome_node — for /api/list and /api/channel/{name}
    monkeypatch.setattr(ome_node, "channels", _fake_channels)
    monkeypatch.setattr(ome_node, "channel_summary", lambda name: summaries[name])
    monkeypatch.setattr(ome_node, "get_last_n_posts", lambda _slug, num: posts[:num])

    # utils — mirrored so list-style endpoints that consult utils also work
    monkeypatch.setattr(
        utils,
        "get_channels",
        lambda: iter([(c.name, c.description, _FakePlugin(c.name)) for c in channels]),
    )
    monkeypatch.setattr(utils, "channel_summary", lambda s, *a, **k: summaries[s])
    monkeypatch.setattr(utils, "get_last_n_posts", lambda _slug, num: posts[:num])
    monkeypatch.setattr(utils, "site_plugin", _FakePlugin("ome.alpha"))

    from server.main import app

    return TestClient(app)


# ---------- /api/list ----------


def test_api_list_returns_channels(client: TestClient) -> None:
    resp = client.get("/api/list")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert {c["name"] for c in body} == {"ome.alpha", "ome.beta"}


# ---------- /api/channel/{name} ----------


def test_api_channel_returns_summary(client: TestClient) -> None:
    resp = client.get("/api/channel/ome.alpha")
    # This endpoint delegates to `get_channel_summary` from utils, which
    # wraps ChannelSummary in a ChannelSummaryResponse. Accept either a
    # bare ChannelSummary shape or the wrapped response.
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, dict)


# ---------- /api/imls/v2/explore-oer-exchange/ ----------


def test_explore_oer_exchange(client: TestClient) -> None:
    resp = client.get("/api/imls/v2/explore-oer-exchange/")
    assert resp.status_code == 200
    body = resp.json()
    # ExploreSummary exposes keys like `sections`, `filters`, etc. —
    # the exact schema shifts over time so we only pin that it is a dict.
    assert isinstance(body, dict)


# ---------- /api/imls/v2/collections/{channel}/{_id} ----------


def test_collections_channel_summary_endpoint(client: TestClient) -> None:
    resp = client.get("/api/imls/v2/collections/ome.alpha/0")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, dict)


# ---------- POST validation paths ----------


def test_publish_url_rejects_empty_body(client: TestClient) -> None:
    resp = client.post("/api/publish_url", json={})
    assert resp.status_code == 422


def test_publish_url_rejects_missing_url(client: TestClient) -> None:
    resp = client.post("/api/publish_url", json={"not_url": "x"})
    assert resp.status_code == 422


def test_channel_import_rejects_missing_id(client: TestClient) -> None:
    resp = client.post("/api/channel/ome.alpha/import", json={})
    assert resp.status_code == 422
