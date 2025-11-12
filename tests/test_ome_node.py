# uvx -w=beautifulsoup4,dateparser,httpx,pydantic,pynntp pytest -vv
from collections.abc import Generator, Iterator
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


@pytest.fixture
def enable_a_default_newsgroup(newsgroup: str = "local.test") -> Generator[None]:
    """
    Fixture to enable a default newsgroup for testing purposes.
    This is used to ensure that the 'local.test' newsgroup is available
    for tests that require it.

    Use @pytest.mark.usefixtures("enable_a_default_newsgroup") as discussed at
    https://docs.pytest.org/en/stable/how-to/fixtures.html \
        #use-fixtures-in-classes-and-modules-with-usefixtures
    """
    ome_node.DEFAULT_NEWSGROUP_NAMES.remove(newsgroup)
    yield
    ome_node.DEFAULT_NEWSGROUP_NAMES.add(newsgroup)


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


@pytest.mark.xfail(reason="ome_node.get_client() was removed.", strict=True)
def test_channels() -> None:
    """
    Ensure that the default channels are all disabled.
    """
    assert not list(ome_node.channels())


@pytest.mark.usefixtures("enable_a_default_newsgroup")
@pytest.mark.xfail(reason="enable_a_default_newsgroup() is broken.", strict=True)
def test_one_channel() -> None:
    """
    Let's enable the channel 'local.test' so we can use it for the remaining tests.
    """
    for channel in ome_node.channels():
        assert channel.name == "local.test"
        assert channel.description == "Local test group"


@pytest.mark.usefixtures("enable_a_default_newsgroup")
@pytest.mark.xfail(reason="enable_a_default_newsgroup() is broken.", strict=True)
def test_channel_summary() -> None:
    nntp_client = ome_node.get_client()
    for channel in ome_node.channels():
        channel_summary = ome_node.channel_summary(channel.name)
        total, first, last, group = nntp_client.group(channel_summary.name)
        assert channel_summary.name == group == "local.test"
        assert channel_summary.estimated_total_articles == total == 0
        assert channel_summary.first_article == first == 1
        assert channel_summary.last_article == last == 0


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
            alignment_tags=["Mystery", "Sue Grafton", "Kinsey Millhone", keyword],
            keywords=[
                "Mystery",
                "Sue Grafton",
                "Kinsey Millhone",
                f"Books from {year}",
            ],
        )


@pytest.mark.usefixtures("enable_a_default_newsgroup")
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
    strict=True,
)
@pytest.mark.usefixtures("enable_a_default_newsgroup")
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
    assert len(channels) == 5
    slug, description, plugin = channels[0]
    assert slug == "ome.eric"
    assert description == (
        "Metadata from US DoE's Education Resources Information Center (ERIC) "
        "https://eric.ed.gov"
    )
    assert plugin.mimetypes == ("application/vnd.eric.eric+json",)
    assert dict(plugin.newsgroups) == {"ome.eric": description}
    assert plugin.site_name == "Generic OME Library"
    assert plugin.librarian_contact == "info@iskme.org"
    assert plugin.logo


def test_utils_get_channels_filters() -> None:
    channels = list(utils.get_channels())
    assert len(channels) == 5
    slug, description, plugin = channels[0]
    assert slug == "ome.eric"
    assert description == (
        "Metadata from US DoE's Education Resources Information Center (ERIC) "
        "https://eric.ed.gov"
    )
    assert plugin.mimetypes == ("application/vnd.eric.eric+json",)
    assert dict(plugin.newsgroups) == {"ome.eric": description}
    assert plugin.site_name == "Generic OME Library"
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
