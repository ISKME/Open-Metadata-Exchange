import nntplib
from typing import Iterator

from server import ome_node


def get_newsgroups() -> Iterator[str]:
    client = ome_node.getClient()
    response, newsgroups = client.list()
    assert response.startswith("215")
    for newsgroup in newsgroups:
        yield newsgroup.group


def test_get_client():
    client = ome_node.getClient()
    assert isinstance(client, nntplib.NNTP)
    assert client.nntp_version == 2
    assert client.nntp_implementation == "INN 2.6.4"
    assert client.getwelcome().split()[0] == "200"
    newsgroups = list(get_newsgroups())
    for newsgroup in ome_node.DEFAULT_NEWSGROUPS:
        assert newsgroup in newsgroups


def test_channels():
    channels = list(ome_node.channels())
    assert not channels


def test_channel_summary():
    client = ome_node.getClient()
    for newsgroup in get_newsgroups():
        response, count, first, last, name = client.group(newsgroup)
        assert response.startswith("211")
        channel_summary = ome_node.channelSummary(newsgroup)
        assert channel_summary.name == name == newsgroup
        assert channel_summary.estimatedTotalArticles == count
        assert channel_summary.firstArticle == first
        assert channel_summary.lastArticle == last
