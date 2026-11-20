"""
Check the HEALTHCHECK of the NNTP image: healthy while innd accepts articles,
not when it is throttled.

Skipped by default. Run it with:
    uv run pytest tests/peering -m peering -v
"""

import json
import subprocess

import pytest

from .nodes import PeeringNodes, wait_for

pytestmark = [
    pytest.mark.peering,
    pytest.mark.thread_unsafe,  # throttles node-a, which the other peering tests use
    pytest.mark.iterations(1),
]

NODE = "node-a"
HEALTHY_TIMEOUT = 90  # seconds: start period of the image (60 s) plus a margin


def docker(nodes: PeeringNodes, *args: str) -> str:
    """Run a docker command and return its output."""
    return subprocess.run(  # noqa: S603 - fixed arguments, no shell
        [nodes.docker, *args], capture_output=True, text=True, check=True, timeout=30
    ).stdout.strip()


def container_id(nodes: PeeringNodes) -> str:
    return nodes.compose("ps", "--quiet", NODE).stdout.strip()


def healthcheck_command(nodes: PeeringNodes) -> str:
    """The HEALTHCHECK command of the image, so the test checks what the image ships."""
    image = docker(nodes, "inspect", "--format", "{{.Image}}", container_id(nodes))
    test = json.loads(
        docker(nodes, "inspect", "--format", "{{json .Config.Healthcheck.Test}}", image)
    )
    assert test[0] == "CMD-SHELL", test
    return test[1]


def test_docker_reports_healthy(peering_nodes: PeeringNodes) -> None:
    """A running node turns healthy in docker ps."""
    cid = container_id(peering_nodes)

    def healthy() -> bool | None:
        status = docker(
            peering_nodes, "inspect", "--format", "{{.State.Health.Status}}", cid
        )
        return True if status == "healthy" else None

    assert wait_for(healthy, HEALTHY_TIMEOUT), (
        f"{NODE} is not healthy after {HEALTHY_TIMEOUT} s:\n"
        + docker(peering_nodes, "inspect", "--format", "{{json .State.Health}}", cid)
    )


def test_healthcheck_fails_when_throttled(peering_nodes: PeeringNodes) -> None:
    """A throttled innd (as on a full disk) refuses articles, so it is not healthy."""
    command = healthcheck_command(peering_nodes)

    def check() -> int:
        return peering_nodes.exec(NODE, "sh", "-c", command, check=False).returncode

    assert check() == 0, "the healthcheck fails on a running innd"
    peering_nodes.exec(NODE, "ctlinnd", "throttle", "healthcheck test")
    try:
        assert check() != 0, "the healthcheck passes on a throttled innd"
    finally:
        peering_nodes.exec(NODE, "ctlinnd", "go", "healthcheck test")
    assert check() == 0, "the healthcheck fails after ctlinnd go"
