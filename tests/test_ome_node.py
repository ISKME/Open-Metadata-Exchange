import nntplib

from server import ome_node


def test_get_client():
    client = ome_node.getClient()
    assert isinstance(client, nntplib.NNTP)
    assert client.nntp_version == 2
    assert client.nntp_implementation == "INN 2.6.4"
    assert client.getwelcome().split()[0] == "200"
    newsgroups = [newsgroup.group for newsgroup in client.list()[1]]
    for newsgroup in ome_node.DEFAULT_NEWSGROUPS:
        assert newsgroup in newsgroups


def test_channels():
    channels = list(ome_node.channels())
    assert not channels
