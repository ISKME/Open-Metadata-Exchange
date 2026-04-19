# uvx -w=beautifulsoup4,dateparser,httpx,pydantic,pynntp pytest -vv
from collections.abc import Iterator
from datetime import datetime, timezone

import nntp
import pytest

from server import ome_node, schemas, utils
from server.connection_pool import ClientContextManager

AUSTIN_PORT = 119
BOSTON_PORT = AUSTIN_PORT + 1000
DEFAULT_NEWSGROUPS: dict[str, str] = {
    ("control.cancel", "Cancel messages (no posting)"),
    ("control.checkgroups", "Hierarchy check control messages (no posting)"),
    ("control.newgroup", "Newsgroup creation control messages (no posting)"),
    ("control.rmgroup", "Newsgroup removal control messages (no posting)"),
    ("control", "Various control messages (no posting)"),
    ("junk", "Unfiled articles (no posting)"),
    ("local.general", "Local general group"),
    ("local.test", "Local test group"),
}


# NB: issue #7 — three strict-xfail tests and a broken
# `enable_a_default_newsgroup` fixture used to live here. They were
# removed because:
#   * `test_channels` / `test_one_channel` / `test_channel_summary`
#     xfailed strictly on removed `ome_node.get_client()` and on a
#     fixture that was already guaranteed to KeyError (because
#     `server/card_editor.py` pre-mutates `DEFAULT_NEWSGROUP_NAMES`
#     at import time).
#   * Strict xfail masks real regressions and produces XPASS churn.
# See `tests/test_no_strict_xfail.py` for the regression guard.


def test_pynntp_client() -> None:
    with ClientContextManager() as pynntp_client:
        assert isinstance(pynntp_client, nntp.NNTPClient)
        # See https://github.com/greenbender/pynntp/issues/95
        newsgroups = set(pynntp_client.list_newsgroups())
        assert newsgroups == DEFAULT_NEWSGROUPS
        newsgroup_names = {
            name for name, _low, _high, _status in pynntp_client.list_active()
        }
        assert newsgroup_names == ome_node.DEFAULT_NEWSGROUP_NAMES, (
            f"Expected names {ome_node.DEFAULT_NEWSGROUP_NAMES}, but got "
            f"{newsgroup_names}"
        )


jane_austen_novels = {
    "Sense and Sensibility": 1811,
    "Pride and Prejudice": 1813,
    "Mansfield Park": 1814,
    "Emma": 1816,
    "Northanger Abbey": 1818,
    "Persuasion": 1819,
    "Lady Susan": 1871,
}


def sample_metadata_austin() -> Iterator[schemas.Metadata]:
    for title, year in jane_austen_novels.items():
        keyword = title.split()[-1]  # "Sense and Sensibility" --> "Sensibility"
        yield schemas.Metadata(
            title=title,
            url=f"https://en.wikipedia.org/wiki/{title}".replace(" ", "_"),
            description=f"{title} is a novel by Jane Austen",
            subject="Sensibility",
            author="Jane Austen",
            spdx_license="MIT",
            alignment_tags=["Sensibility", "Jane Austen", keyword],
            keywords=[
                "Sensibility",
                "Jane Austen",
                f"Books from {year}",
            ],
        )


sue_grafton_books = {
    "A is for Alibi": 1982,
    "B is for Burglar": 1985,
    "C is for Corpse": 1986,
    "D is for Deadbeat": 1987,
    "E is for Evidence": 1988,
    "F is for Fugitive": 1989,
    "G is for Gumshoe": 1990,
    "H is for Homicide": 1991,
    "I is for Innocent": 1992,
    "J is for Judgment": 1993,
    "K is for Killer": 1994,
    "L is for Lawless": 1995,
    "M is for Malice": 1996,
    "N is for Noose": 1998,
    "O is for Outlaw": 1999,
    "P is for Peril": 2001,
    "Q is for Quarry": 2002,
    "R is for Ricochet": 2004,
    "S is for Silence": 2005,
    "T is for Trespass": 2007,
    "U is for Undertow": 2009,
    "V is for Vengeance": 2011,
    "W is for Wasted": 2013,
    "X": 2015,
    "Y is for Yesterday": 2017,
}


def sample_metadata_boston() -> Iterator[schemas.Metadata]:
    for title, year in sue_grafton_books.items():
        keyword = title.split()[-1]  # "A is for Alibi" --> "Alibi"
        yield schemas.Metadata(
            title=title,
            url=f"https://en.wikipedia.org/wiki/{title}".replace(" ", "_"),
            description=f"{title} is a mystery novel by Sue Grafton",
            subject="Mystery",
            author="Sue Grafton",
            spdx_license="MIT",
            alignment_tags=["Mystery", "Sue Grafton", "Kinsey Millhone", keyword],
            keywords=[
                "Mystery",
                "Sue Grafton",
                "Kinsey Millhone",
                f"Books from {year}",
            ],
        )


@pytest.mark.parametrize("metadata", sample_metadata_boston())
def test_create_post(metadata: schemas.Metadata) -> None:
    assert isinstance(metadata, schemas.Metadata)
    assert metadata.title in sue_grafton_books
    ome_node.create_post(
        schemas.Post(
            id=int(datetime.now(timezone.utc).timestamp() * 1000),  # noqa: UP017
            channels=["local.test"],
            admin_contact="sue@grafton.com",
            subject=metadata.title,
            body=metadata.model_dump_json(),
            attachments=[],
            date=None,
        ),
    )


@pytest.mark.skipif(
    not hasattr(ome_node, "channel_cards"),
    reason="channel_cards was removed",
)
def test_channel_cards() -> None:
    cards = list(ome_node.channel_cards("local.test", 1, 100))
    assert len(cards) == len(sue_grafton_books)
    first_card = cards[0]
    assert first_card.number == 1
    assert first_card.body.title == "A is for Alibi"
    assert first_card.body.url == "https://en.wikipedia.org/wiki/A_is_for_Alibi"
    last_card = cards[-1]
    assert last_card.number == len(sue_grafton_books) == 25
    assert last_card.body.title == "Y is for Yesterday"
    assert last_card.body.url == "https://en.wikipedia.org/wiki/Y_is_for_Yesterday"


# @pytest.mark.usefixtures("enable_a_default_newsgroup")
@pytest.mark.parametrize("metadata", sample_metadata_boston())
def test_utils_get_channels(metadata: schemas.Metadata) -> None:
    assert isinstance(metadata, schemas.Metadata)
    assert metadata.title in sue_grafton_books
    channels = list(utils.get_channels())
    assert len(channels) == 10
    slug, description, plugin = channels[0]
    assert slug == "ome.early_learning"
    assert description == (
        "Metadata from Early Learning Resource Network "
        "https://www.earlylearningresourcenetwork.org"
    )
    assert plugin.mimetypes == ("application/vnd.earlylearning.early-learning+json",)
    assert dict(plugin.newsgroups) == {"ome.early_learning": description}
    assert plugin.site_name == "Early Learning Resource Network"
    assert plugin.librarian_contact == "info@iskme.org"
    assert plugin.logo


def test_utils_get_channels_filters() -> None:
    channels = list(utils.get_channels())
    assert len(channels) == 10
    slug, description, plugin = channels[0]
    assert slug == "ome.early_learning"
    assert description == (
        "Metadata from Early Learning Resource Network "
        "https://www.earlylearningresourcenetwork.org"
    )
    assert plugin.mimetypes == ("application/vnd.earlylearning.early-learning+json",)
    assert dict(plugin.newsgroups) == {"ome.early_learning": description}
    assert plugin.site_name == "Early Learning Resource Network"
    assert plugin.librarian_contact == "info@iskme.org"


# def test_utils_get_latest_articles(metadata: schemas.Metadata) -> None:
# def test_utils_get_active_channels() -> None:
# def test_utils_explore_summary() -> ExploreSummary:
# def test_utils_post_to_summary(post: Post) -> ResourceSummaryData:
# def test_utils_post_to_details(post: Post) -> ResourceDetailData:
# def test_utils_browse_results(
#     sortby: str = "timestamp", per_page: int = 3
# ) -> BrowseResponse:
# def test_utils_get_channel_summary(
# def test_utils_get_channel_resources(
