"""
Prove that a node starts again after a clean stop and after a hard kill.

Skipped by default. Run it with:
    uv run pytest tests/peering -m peering -v
"""

import uuid

import pytest

from .nodes import NODES, PeeringNodes, wait_for

pytestmark = [
    pytest.mark.peering,
    pytest.mark.thread_unsafe,  # stops and starts a node that the other tests share
    pytest.mark.iterations(1),  # one restart of each kind is enough
]

NODE = "node-b"
STORE_TIMEOUT = 10  # seconds for a posted article to show up in the history


def post_article(nodes: PeeringNodes) -> str:
    """Post an article on NODE, wait until it is stored and return its Message-ID."""
    message_id = f"<restart-{uuid.uuid4().hex}@{NODE}.invalid>"
    nodes.post(NODE, message_id, f"Article that must survive a restart of {NODE}")
    assert wait_for(lambda: nodes.find(NODE, message_id), STORE_TIMEOUT), (
        f"Article {message_id} was not stored on {NODE}"
    )
    return message_id


def start_again(nodes: PeeringNodes) -> None:
    """Start NODE again and let its peers reconnect at once.

    While NODE was down, innfeed on the peers failed to connect and now waits
    30 s, 60 s, 120 s ... before the next try. Restarting innfeed resets that wait,
    so the next tests do not depend on it. How a peer recovers after an outage is
    a test of its own.
    """
    nodes.start(NODE)
    for peer in NODES:
        if peer != NODE:
            nodes.exec(peer, "ctlinnd", "flush", "innfeed!")


def test_clean_stop_and_start(peering_nodes: PeeringNodes) -> None:
    """docker compose stop lets INN shut down cleanly, and the node starts again."""
    message_id = post_article(peering_nodes)
    try:
        peering_nodes.stop(NODE)
        assert peering_nodes.exit_code(NODE) == 0, (
            f"INN on {NODE} did not stop cleanly (exit code "
            f"{peering_nodes.exit_code(NODE)}): it was killed before it could shut down"
        )
    finally:
        start_again(peering_nodes)
    assert peering_nodes.find(NODE, message_id), f"{message_id} is gone after a restart"


def test_hard_kill_and_start(peering_nodes: PeeringNodes) -> None:
    """After SIGKILL, like a power cut, the node starts again without manual cleanup."""
    message_id = post_article(peering_nodes)
    try:
        peering_nodes.kill(NODE)
    finally:
        start_again(peering_nodes)
    assert peering_nodes.find(NODE, message_id), (
        f"{message_id} is gone after a hard kill"
    )
