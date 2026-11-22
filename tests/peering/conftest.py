"""
Fixture for the peering test: two INN nodes started with Docker Compose.

The nodes are started once per test session and always removed again,
also when a test fails.
"""

import os
import shutil
import subprocess
from collections.abc import Iterator
from pathlib import Path

import pytest

from .nodes import BUILD_TIMEOUT, NEWSGROUP, NODES, PeeringNodes


def save_logs(nodes: PeeringNodes) -> None:
    """Write the logs of both nodes to $PEERING_LOGS_DIR, if it is set.

    Called before "down", because the logs are gone with the containers.
    Saving logs must never fail the test, so every error is ignored.
    """
    if not (logs_dir := os.environ.get("PEERING_LOGS_DIR")):
        return
    try:
        target = Path(logs_dir)
        target.mkdir(parents=True, exist_ok=True)
        for node in NODES:
            compose_logs = nodes.compose("logs", "--no-color", node, check=False)
            (target / f"{node}-compose.log").write_text(
                compose_logs.stdout + compose_logs.stderr
            )
            innfeed = nodes.exec(node, "cat", "/var/log/news/innfeed.log", check=False)
            (target / f"{node}-innfeed.log").write_text(innfeed.stdout + innfeed.stderr)
    except (OSError, subprocess.SubprocessError) as error:
        print(f"Could not save peering logs to {logs_dir}: {error}")


@pytest.fixture(scope="session")
def peering_nodes() -> Iterator[PeeringNodes]:
    """Start both nodes, wait until INN is ready, create the test group, clean up."""
    docker = shutil.which("docker")
    if docker is None:
        pytest.fail("The peering test needs Docker with Docker Compose v2 on PATH.")
    nodes = PeeringNodes(docker)
    try:
        nodes.compose("up", "--detach", "--build", timeout=BUILD_TIMEOUT)
        for node in NODES:
            nodes.wait_ready(node)
            # A node only stores articles in groups it knows.
            nodes.exec(node, "ctlinnd", "newgroup", NEWSGROUP)
        yield nodes
    finally:
        save_logs(nodes)
        # No --volumes: there are none, and it would delete data in other setups.
        nodes.compose("down", "--remove-orphans", check=False)
