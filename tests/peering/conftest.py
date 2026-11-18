"""
Fixture for the peering test: two INN nodes started with Docker Compose.

The nodes are started once per test session and always removed again,
also when a test fails.
"""

import shutil
from collections.abc import Iterator

import pytest

from .nodes import (
    BUILD_TIMEOUT,
    NEWSGROUP,
    NODES,
    READY_TIMEOUT,
    PeeringNodes,
    wait_for,
)


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
            if not wait_for(lambda node=node: nodes.is_ready(node), READY_TIMEOUT):
                pytest.fail(
                    f"INN on {node} was not ready within {READY_TIMEOUT} s.\n\n"
                    f"{nodes.diagnostics(node)}"
                )
            # A node only stores articles in groups it knows.
            nodes.exec(node, "ctlinnd", "newgroup", NEWSGROUP)
        yield nodes
    finally:
        # No --volumes: there are none, and it would delete data in other setups.
        nodes.compose("down", "--remove-orphans", check=False)
