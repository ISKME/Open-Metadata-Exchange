# from typing import Iterator

from server import ome_node


def test_nntp_client():
    nntp_client = ome_node.getClient()
    assert isinstance(nntp_client, ome_node.nntp.NNTPClient)
    newsgroups = set(nntp_client.list_newsgroups())
    assert newsgroups == ome_node.DEFAULT_NEWSGROUPS


def test_channels():
    assert not list(ome_node.channels())


def test_one_channel():
    ome_node.DEFAULT_NEWSGROUPS.remove(("local.test", "Local test group"))
    for channel in ome_node.channels():
        assert channel.name == "local.test"
        assert channel.description == "Local test group"


def test_channel_summary():
    nntp_client = ome_node.getClient()
    for channel in ome_node.channels():
        channel_summary = ome_node.channelSummary(channel.name)
        total, first, last, group = nntp_client.group(channel_summary.name)
        assert channel_summary.name == group == "local.test"
        # assert channel_summary.estimatedTotalArticles == total == 2
        assert channel_summary.firstArticle == first == 1
        # assert channel_summary.lastArticle == last == 2
