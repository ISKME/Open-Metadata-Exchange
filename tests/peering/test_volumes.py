"""
Check that INN's data lives in volumes: a new container keeps it,
and empty host folders work.

Skipped by default. Run it with:
    uv run pytest tests/peering -m peering -v
"""

import subprocess
import time
import uuid
from pathlib import Path

import pytest

from .nodes import NEWSGROUP, READY_TIMEOUT, PeeringNodes, wait_for

pytestmark = [
    pytest.mark.peering,
    pytest.mark.thread_unsafe,  # replaces the container of node-b
    pytest.mark.iterations(1),
]

NODE = "node-b"
PEER = "node-a"
IMAGE = "ome-nntp:peering-test"  # Built by the fixture, see compose.yaml
NODE_A_CONFIG = Path(__file__).parent / "node-a.json"
STORE_TIMEOUT = 10  # seconds for a posted article to show up in the history


def container_id(nodes: PeeringNodes) -> str:
    return nodes.compose("ps", "--quiet", NODE).stdout.strip()


def test_new_container_keeps_the_data(peering_nodes: PeeringNodes) -> None:
    """A new container (as with a new image) keeps articles, groups and history."""
    message_id = f"<volumes-{uuid.uuid4().hex}@{NODE}.invalid>"
    peering_nodes.post(NODE, message_id, "Article that must survive a new container")
    assert wait_for(lambda: peering_nodes.find(NODE, message_id), STORE_TIMEOUT)
    old_container = container_id(peering_nodes)

    peering_nodes.compose("up", "--detach", "--force-recreate", "--no-deps", NODE)
    assert container_id(peering_nodes) != old_container, "no new container"
    assert wait_for(lambda: peering_nodes.is_ready(NODE), READY_TIMEOUT)
    # The peer would wait up to its reconnect time before it tries the new node.
    peering_nodes.exec(PEER, "ctlinnd", "flush", "innfeed!", check=False)

    token = peering_nodes.find(NODE, message_id)  # history
    assert token, f"{message_id} is gone after a new container"
    assert peering_nodes.header(NODE, token, "Message-ID") == message_id  # spool
    active = peering_nodes.exec(NODE, "cat", "/var/lib/news/active").stdout
    assert any(line.split()[0] == NEWSGROUP for line in active.splitlines()), (
        f"{NEWSGROUP} is gone from the active file"
    )


def test_empty_host_folders(peering_nodes: PeeringNodes, tmp_path: Path) -> None:
    """Empty host folders as volumes: the node fills them and starts."""
    db, spool = tmp_path / "db", tmp_path / "spool"
    db.mkdir()
    spool.mkdir()
    docker = peering_nodes.docker
    container = subprocess.run(  # noqa: S603 - fixed arguments, no shell
        [
            docker, "run", "--detach",
            "-v", f"{NODE_A_CONFIG}:/run/secrets/ome_config:ro",
            "-v", f"{db}:/var/lib/news",
            "-v", f"{spool}:/var/spool/news",
            IMAGE,
        ],
        capture_output=True, text=True, check=True, timeout=60,
    ).stdout.strip()  # fmt: skip

    def mode() -> str:
        return subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [docker, "exec", container, "ctlinnd", "mode"],
            capture_output=True, text=True, check=False, timeout=30,
        ).stdout  # fmt: skip

    try:
        deadline = time.monotonic() + READY_TIMEOUT
        while "Server running" not in mode() and time.monotonic() < deadline:
            time.sleep(1)
        assert "Server running" in mode(), subprocess.run(  # noqa: S603
            [docker, "logs", container], capture_output=True, text=True, check=False
        ).stderr
        assert (db / "active").is_file()
        assert (db / "history").is_file()
        assert (spool / "articles").is_dir()
    finally:
        # The files belong to the news user of the container: let pytest remove them.
        subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [docker, "exec", container, "chmod", "-R", "a+rwX",
             "/var/lib/news", "/var/spool/news"],
            capture_output=True, check=False, timeout=30,
        )  # fmt: skip
        subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [docker, "rm", "--force", container],
            capture_output=True, check=False, timeout=60,
        )  # fmt: skip
