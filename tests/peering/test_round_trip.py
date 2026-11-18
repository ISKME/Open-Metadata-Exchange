"""
Prove that two INN nodes exchange articles in both directions.

Skipped by default. Run it with:
    uv run pytest tests/peering -m peering -v
"""

import uuid

import pytest

from .nodes import PeeringNodes, wait_for

pytestmark = [
    pytest.mark.peering,
    pytest.mark.thread_unsafe,  # both tests share the same two nodes
    pytest.mark.iterations(1),  # one article per direction is enough
]

# innfeed retries an unreachable peer after 30 s (initial-reconnect-time),
# so wait clearly longer than that before calling it a failure.
ARRIVAL_TIMEOUT = 90


@pytest.mark.parametrize(
    ("sender", "receiver"),
    [("node-a", "node-b"), ("node-b", "node-a")],
    ids=["a_to_b", "b_to_a"],
)
def test_article_reaches_peer(
    peering_nodes: PeeringNodes, sender: str, receiver: str
) -> None:
    message_id = f"<peering-{uuid.uuid4().hex}@{sender}.invalid>"
    peering_nodes.post(sender, message_id, f"Peering round trip {sender} to {receiver}")

    token = wait_for(lambda: peering_nodes.find(receiver, message_id), ARRIVAL_TIMEOUT)
    if token is None:
        pytest.fail(
            f"Article {message_id} posted on {sender} did not arrive on {receiver} "
            f"within {ARRIVAL_TIMEOUT} s. Is each node listed as a peer in the "
            f"other's config?\n\n{peering_nodes.diagnostics(sender, receiver)}"
        )

    # Path is read right to left: posted on the sender, then stored on the receiver.
    path = peering_nodes.header(receiver, token, "Path")
    assert path.startswith(f"{receiver}!{sender}!"), (
        f"Article {message_id} is on {receiver}, but not via {sender}: Path: {path}"
    )
