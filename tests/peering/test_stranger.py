"""
Prove that a stranger cannot put articles on a node, and that a client that logs in can.

A third container on the network of the two nodes, in no config, talks NNTP to node-a.
It is not a peer, so innd hands it to nnrpd (the reader server), where readers.conf
decides what it may do.

Skipped by default. Run it with:
    uv run pytest tests/peering -m peering -v
"""

import json
import shutil
import subprocess
import uuid
from pathlib import Path

import pytest

from .nodes import NEWSGROUP, PeeringNodes, wait_for

pytestmark = [
    pytest.mark.peering,
    pytest.mark.thread_unsafe,  # uses the nodes of the session
    pytest.mark.iterations(1),
]

NETWORK = "ome-peering-test_peering"  # <compose project>_<network> of compose.yaml
STRANGER_IP = "172.30.0.99"  # A fixed address in the test network, in no config
CLIENT_IMAGE = "python:3.13-alpine"
NODE = "node-a"
PEER = "node-b"
SPREAD_TIMEOUT = 20  # seconds for innfeed to pass an article on to the peer
NODE_A_CONFIG = json.loads((Path(__file__).parent / "node-a.json").read_text())

# A small NNTP client: each step is a command, and an article to send after a
# 335/340 reply. It prints every reply as JSON, for the test to read.
CLIENT = """
import json, socket, sys
steps = json.loads(sys.argv[1])
conn = socket.create_connection(("node-a", 119), timeout=10)
file = conn.makefile("rwb")
replies = [file.readline().decode().strip()]
for command, article in steps:
    if command.startswith("TAKETHIS"):  # a streaming peer sends the article at once
        file.write((command + "\\r\\n").encode() + article.encode() + b".\\r\\n")
        file.flush()
        replies.append(file.readline().decode().strip())
        continue
    file.write((command + "\\r\\n").encode()); file.flush()
    reply = file.readline().decode().strip()
    replies.append(reply)
    if article is not None and reply[:3] in ("335", "340"):
        file.write(article.encode() + b".\\r\\n"); file.flush()
        replies.append(file.readline().decode().strip())
    elif reply.startswith("215"):
        while file.readline().decode().rstrip("\\r\\n") != ".":
            pass
print(json.dumps(replies))
"""


def talk(steps: list[tuple[str, str | None]]) -> list[str]:
    """Run the client in a container on the nodes' network; return INN's replies."""
    docker = shutil.which("docker")
    assert docker, "the peering test needs Docker"
    result = subprocess.run(  # noqa: S603 - fixed arguments, no shell
        [docker, "run", "--rm", "--network", NETWORK, "--ip", STRANGER_IP, CLIENT_IMAGE,
         "python", "-c", CLIENT, json.dumps(steps)],
        capture_output=True, text=True, check=True, timeout=120,
    )  # fmt: skip
    return json.loads(result.stdout)


def article(message_id: str, how: str) -> str:
    return (
        f"Path: stranger\r\nFrom: stranger@evil.invalid\r\nNewsgroups: {NEWSGROUP}\r\n"
        f"Subject: {how} from a stranger\r\nMessage-ID: {message_id}\r\n"
        "Date: Mon, 23 Nov 2026 12:00:00 +0000\r\n\r\nNot from a peer.\r\n"
    )


def login() -> list[tuple[str, str | None]]:
    user = NODE_A_CONFIG["nntp_user"]
    return [
        (f"AUTHINFO USER {user['username']}", None),
        (f"AUTHINFO PASS {user['password']}", None),
    ]


def new_id(kind: str) -> str:
    return f"<stranger-{kind}-{uuid.uuid4().hex}@evil.invalid>"


def test_stranger_cannot_feed_with_ihave(peering_nodes: PeeringNodes) -> None:
    """A stranger cannot offer an article the way a peer does."""
    message_id = new_id("ihave")
    replies = talk([(f"IHAVE {message_id}", article(message_id, "IHAVE"))])
    assert "NNRP" in replies[0], f"a stranger must reach the reader server: {replies}"
    assert replies[1].startswith("480"), f"IHAVE was not refused: {replies}"
    assert not peering_nodes.find(NODE, message_id)


def test_stranger_cannot_stream(peering_nodes: PeeringNodes) -> None:
    """Streaming (CHECK and TAKETHIS) is for peers only."""
    message_id = new_id("takethis")
    steps = [("MODE STREAM", None)]
    replies = talk(steps)
    if replies[1].startswith("203"):  # streaming allowed: then try to deliver
        steps.append((f"TAKETHIS {message_id}", article(message_id, "TAKETHIS")))
        replies = talk(steps)
    assert not replies[1].startswith("203"), f"streaming was allowed: {replies}"
    assert not peering_nodes.find(NODE, message_id)


def test_stranger_cannot_post(peering_nodes: PeeringNodes) -> None:
    """A client that does not log in cannot post, so nothing reaches a peer (#322)."""
    message_id = new_id("post")
    replies = talk([("POST", article(message_id, "POST"))])
    assert "posting ok" not in replies[0], f"a stranger is told it may post: {replies}"
    assert replies[1].startswith("480"), f"POST was not refused: {replies}"
    assert not peering_nodes.find(NODE, message_id)
    assert not wait_for(lambda: peering_nodes.find(PEER, message_id), SPREAD_TIMEOUT)


def test_client_that_logs_in_reads_and_posts(peering_nodes: PeeringNodes) -> None:
    """The API logs in with nntp_user from config.json: it can still read and post."""
    message_id = new_id("api")
    replies = talk(
        [*login(), (f"GROUP {NEWSGROUP}", None), ("POST", article(message_id, "POST"))]
    )
    assert replies[2].startswith("281"), f"login refused: {replies}"
    assert replies[3].startswith("211"), f"no read access after login: {replies}"
    assert replies[-1].startswith("240"), f"post refused after login: {replies}"
    assert wait_for(lambda: peering_nodes.find(NODE, message_id), SPREAD_TIMEOUT)
