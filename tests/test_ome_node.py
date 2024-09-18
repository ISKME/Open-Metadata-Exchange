from server import ome_node


def test_get_client():
    client = ome_node.getClient()
    assert isinstance(client, ome_node.nntp.NNTP)
    assert client.host == "localhost"
    assert client.port == 119
    assert client.use_ssl is False
