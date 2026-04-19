"""Unit tests for ``server.utils`` covering P0 issue #3.

Goals:

* ``post_to_details`` returns honest default values (no fabricated
  ``source=\"Course Related Material\"``, ``visits=22`` etc.).
* ``browse_results`` and ``get_channel_resources`` report a real total
  article count (aggregated via ``ome_node.channel_summary``), not the
  hardcoded ``124``.
* Both endpoints honor a ``page`` parameter — the returned
  ``pagination.page`` reflects the request.
* ``get_channel_summary`` uses the real article count and empty
  education-levels list (the previous hardcoded values were fabricated).

All tests are pure: they monkeypatch ``ome_node`` and the plugin
registry so no NNTP socket is ever touched.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

import pytest

from server.schemas import ChannelSummary, Post

if TYPE_CHECKING:
    pass


def _post(
    post_id: int = 1,
    channel: str = "ome.test",
    subject: str = "Hello",
    body: str = "World",
) -> Post:
    return Post(
        id=post_id,
        channels=[channel],
        admin_contact="librarian@example.test",
        subject=subject,
        body=body,
        attachments=[],
        date=datetime(2026, 4, 19, tzinfo=UTC),
    )


class _FakePlugin:
    def __init__(
        self,
        slug: str = "ome.test",
        description: str = "Test channel",
        site_name: str = "Test Site",
    ) -> None:
        self.newsgroups = {slug: description}
        self.site_name = site_name
        self.librarian_contact = "librarian@example.test"
        self.logo = f"/static/{slug}.svg"


@pytest.fixture
def patched_utils(monkeypatch: pytest.MonkeyPatch) -> dict[str, Any]:
    """Patch utils' collaborators with deterministic fakes.

    Returns a dict of hooks the tests mutate to shape behavior per-test.
    """
    import server.utils as utils

    state: dict[str, Any] = {
        "channels": [
            ("ome.alpha", "Alpha channel", _FakePlugin("ome.alpha", "Alpha channel")),
            ("ome.beta", "Beta channel", _FakePlugin("ome.beta", "Beta channel")),
        ],
        "summaries": {
            "ome.alpha": ChannelSummary(
                name="ome.alpha",
                estimated_total_articles=40,
                first_article=1,
                last_article=40,
            ),
            "ome.beta": ChannelSummary(
                name="ome.beta",
                estimated_total_articles=60,
                first_article=1,
                last_article=60,
            ),
        },
        "latest_by_channel": {
            "ome.alpha": [_post(i, "ome.alpha", f"A{i}") for i in range(1, 6)],
            "ome.beta": [_post(100 + i, "ome.beta", f"B{i}") for i in range(1, 6)],
        },
    }

    def _fake_get_channels() -> Any:
        yield from state["channels"]

    def _fake_channel_summary(slug: str, *_: Any, **__: Any) -> ChannelSummary:
        return state["summaries"][slug]

    def _fake_get_last_n_posts(slug: str, num: int) -> list[Post]:
        return state["latest_by_channel"].get(slug, [])[:num]

    monkeypatch.setattr(utils, "get_channels", _fake_get_channels)
    monkeypatch.setattr(utils, "channel_summary", _fake_channel_summary)
    monkeypatch.setattr(utils, "get_last_n_posts", _fake_get_last_n_posts)
    # site_plugin is used for top-level metadata (tenant slug, contact)
    monkeypatch.setattr(utils, "site_plugin", _FakePlugin("ome.alpha", "Alpha channel"))

    return state


# -----------------------------------------------------------------------
# post_to_details — honest defaults
# -----------------------------------------------------------------------


def test_post_to_details_has_no_fabricated_values() -> None:
    from server.utils import post_to_details

    details = post_to_details(_post(42, "ome.alpha", "Some Subject", "Body text"))

    # Previous bug: these were hardcoded fake values shipped to clients.
    assert details.source == ""  # was "Course Related Material"
    assert details.grade_sublevel == []  # was ["High School"]
    assert details.license == ""  # was "educational-use-permitted"
    assert details.license_cou_bucket == ""
    assert details.license_types == []
    assert details.license_bucket_title == ""
    assert details.visits == 0  # was 22

    # Real values that should still round-trip unchanged:
    assert details.id == 42
    assert details.title == "Some Subject"
    assert details.abstract == "Body text"
    assert details.site == "ome.alpha"
    assert details.collections == ["ome.alpha"]


# -----------------------------------------------------------------------
# browse_results — real count, real page
# -----------------------------------------------------------------------


def test_browse_results_total_count_aggregates_channel_summaries(
    patched_utils: dict[str, Any],  # noqa: ARG001 — fixture wires patches
) -> None:
    from server.utils import browse_results

    result = browse_results(per_page=10)
    # 40 + 60 = 100 across the two channels, not the hardcoded 124.
    assert result.collections.pagination.count == 100
    assert result.collections.pagination.numPages == 10


def test_browse_results_honors_page_parameter(
    patched_utils: dict[str, Any],  # noqa: ARG001
) -> None:
    from server.utils import browse_results

    result = browse_results(per_page=10, page=3)
    assert result.collections.pagination.page == 3
    assert result.collections.pagination.perPage == 10


def test_browse_results_defaults_to_page_1(
    patched_utils: dict[str, Any],  # noqa: ARG001
) -> None:
    from server.utils import browse_results

    result = browse_results(per_page=10)
    assert result.collections.pagination.page == 1


# -----------------------------------------------------------------------
# get_channel_resources — real count, real page
# -----------------------------------------------------------------------


def test_get_channel_resources_uses_real_count(
    patched_utils: dict[str, Any],  # noqa: ARG001
) -> None:
    from server.utils import get_channel_resources

    result = get_channel_resources("ome.alpha", per_page=10)
    assert result.resources.pagination.count == 40  # alpha's estimate
    assert result.resources.pagination.numPages == 4


def test_get_channel_resources_honors_page(
    patched_utils: dict[str, Any],  # noqa: ARG001
) -> None:
    from server.utils import get_channel_resources

    result = get_channel_resources("ome.beta", per_page=30, page=2)
    assert result.resources.pagination.page == 2
    assert result.resources.pagination.count == 60


# -----------------------------------------------------------------------
# get_channel_summary — real count, no fabricated education levels
# -----------------------------------------------------------------------


def test_get_channel_summary_uses_real_count_and_empty_levels(
    patched_utils: dict[str, Any],  # noqa: ARG001
) -> None:
    from server.utils import get_channel_summary

    result = get_channel_summary("ome.beta")
    # Before: hardcoded numResources=100 and fabricated educationLevels list.
    assert result.collection.numResources == 60
    assert result.collection.educationLevels == []
