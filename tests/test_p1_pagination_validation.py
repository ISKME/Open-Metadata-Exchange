"""Issue #5 — bounds validation on `page` / `page_size` query parameters.

Pagination params that used to accept any int (including negatives and
six-digit `page_size=999999`) now round-trip through
`fastapi.Query(ge=1, le=200)` and produce 422s for out-of-range input.

We stub ``server.utils`` collaborators (same approach as
``tests/test_p0_main_endpoints.py``) so validation, not NNTP plumbing,
drives the assertions.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import pytest
from fastapi.testclient import TestClient

from server.schemas import ChannelSummary, Post

PAGE_SIZE_MAX = 200


class _FakePlugin:
    def __init__(self, slug: str) -> None:
        self.newsgroups = {slug: "desc"}
        self.site_name = "Site"
        self.librarian_contact = "librarian@example.test"
        self.logo = "/static/logo.svg"


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


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
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


# ---------- /api/imls/v2/collections/browse/ ----------


def test_browse_rejects_page_zero(client: TestClient) -> None:
    response = client.get("/api/imls/v2/collections/browse/?page=0")
    assert response.status_code == 422


def test_browse_rejects_negative_page(client: TestClient) -> None:
    response = client.get("/api/imls/v2/collections/browse/?page=-5")
    assert response.status_code == 422


def test_browse_rejects_excessive_per_page(client: TestClient) -> None:
    response = client.get(
        f"/api/imls/v2/collections/browse/?per_page={PAGE_SIZE_MAX + 1}"
    )
    assert response.status_code == 422


def test_browse_accepts_boundary_values(client: TestClient) -> None:
    response = client.get(
        f"/api/imls/v2/collections/browse/?page=1&per_page={PAGE_SIZE_MAX}"
    )
    assert response.status_code == 200


# ---------- /api/imls/v2/collections/{channel}/{id}/resources ----------


def test_channel_resources_rejects_negative_page(client: TestClient) -> None:
    response = client.get("/api/imls/v2/collections/ome.alpha/1/resources?page=-1")
    assert response.status_code == 422


def test_channel_resources_rejects_zero_per_page(client: TestClient) -> None:
    response = client.get(
        "/api/imls/v2/collections/ome.alpha/1/resources?per_page=0"
    )
    assert response.status_code == 422


# ---------- /api/imls/v2/resources/ ----------


def test_tenant_resources_rejects_excessive_per_page(client: TestClient) -> None:
    response = client.get(
        f"/api/imls/v2/resources/?tenant=ome.alpha&per_page={PAGE_SIZE_MAX + 1}"
    )
    assert response.status_code == 422


# ---------- /api/channel/{name}/cards ----------


def test_channel_cards_rejects_zero_page(client: TestClient) -> None:
    response = client.get("/api/channel/ome.alpha/cards?page=0")
    assert response.status_code == 422


def test_channel_cards_rejects_excessive_page_size(client: TestClient) -> None:
    response = client.get(
        f"/api/channel/ome.alpha/cards?page_size={PAGE_SIZE_MAX + 1}"
    )
    assert response.status_code == 422
