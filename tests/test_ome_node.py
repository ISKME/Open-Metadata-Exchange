# from typing import Iterator

from collections.abc import Iterator
import pytest
from server import ome_node


def test_nntp_client():
    nntp_client = ome_node.getClient()
    assert isinstance(nntp_client, ome_node.nntp.NNTPClient)
    newsgroups = set(nntp_client.list_newsgroups())
    assert newsgroups == ome_node.DEFAULT_NEWSGROUPS


def test_channels():
    """
    Ensure that the default channels are all disabled.
    """
    assert not list(ome_node.channels())


def test_one_channel():
    """
    Let's enable the channel 'local.test' so we can use it for the remaining tests.
    """
    ome_node.enable_a_default_channel()
    for channel in ome_node.channels():
        assert channel.name == "local.test"
        assert channel.description == "Local test group"


def test_channel_summary():
    nntp_client = ome_node.getClient()
    for channel in ome_node.channels():
        channel_summary = ome_node.channelSummary(channel.name)
        total, first, last, group = nntp_client.group(channel_summary.name)
        assert channel_summary.name == group == "local.test"
        assert channel_summary.estimatedTotalArticles == total == 0
        assert channel_summary.firstArticle == first == 1
        assert channel_summary.lastArticle == last == 0


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


def sample_metadata() -> Iterator[ome_node.Metadata]:
    for title, year in sue_grafton_books.items():
        keyword = title.split()[-1]  # "A is for Alibi" --> "Alibi"
        yield ome_node.Metadata(
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


@pytest.mark.parametrize("metadata", sample_metadata())
def test_create_post(metadata):
    assert isinstance(metadata, ome_node.Metadata)
    assert metadata.title in sue_grafton_books
    ome_node.createPost(
        ome_node.NewCard(channels=["local.test"], subject=metadata.title, body=metadata)
    )


def test_channel_cards():
    cards = list(ome_node.channelCards("local.test", 1, 100))
    assert len(cards) == len(sue_grafton_books)
    first_card = cards[0]
    assert first_card.number == 1
    assert first_card.body.title == "A is for Alibi"
    assert first_card.body.url == "https://en.wikipedia.org/wiki/A_is_for_Alibi"
    last_card = cards[-1]
    assert last_card.number == len(sue_grafton_books) == 25
    assert last_card.body.title == "Y is for Yesterday"
    assert last_card.body.url == "https://en.wikipedia.org/wiki/Y_is_for_Yesterday"
