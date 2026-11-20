"""
Check that the innfeed reconnect times from config.json end up in innfeed.conf,
and that a node with a wrong time does not start.

Skipped by default. Run it with:
    uv run pytest tests/peering -m peering -v
"""

import json
import subprocess
from pathlib import Path

import pytest

from .nodes import PeeringNodes

pytestmark = [
    pytest.mark.peering,
    pytest.mark.thread_unsafe,  # uses the same two nodes as the other peering tests
    pytest.mark.iterations(1),  # reading a file once is enough
]

TEMPLATE = "/etc/news/innfeed.conf.j2"  # Kept next to the rendered file in the image
CONFIG_EXAMPLE = Path(__file__).parents[2] / "config.json.example"  # Has no "innfeed"
NODE_A_CONFIG = Path(__file__).parent / "node-a.json"
IMAGE = "ome-nntp:peering-test"  # Built by the fixture, see compose.yaml


def reconnect_times(innfeed_conf: str) -> dict[str, str]:
    """The values of initial-reconnect-time and max-reconnect-time in innfeed.conf."""
    times = {}
    for line in innfeed_conf.splitlines():
        name, _, value = line.partition(":")
        if name in {"initial-reconnect-time", "max-reconnect-time"}:
            times[name] = value.split("#")[0].strip()
    return times


def test_reconnect_times_from_config(peering_nodes: PeeringNodes) -> None:
    """node-a.json sets short times, so the rendered innfeed.conf must contain them."""
    conf = peering_nodes.exec("node-a", "cat", "/etc/news/innfeed.conf").stdout
    assert reconnect_times(conf) == {
        "initial-reconnect-time": "2",
        "max-reconnect-time": "10",
    }


def test_reconnect_times_default(peering_nodes: PeeringNodes) -> None:
    """Without "innfeed" in config.json, the template keeps INN's defaults.

    Rendered inside the node, with the same j2 as the entrypoint uses.
    """
    conf = peering_nodes.exec(
        "node-a", "j2", "--format=json", TEMPLATE,
        input_text=CONFIG_EXAMPLE.read_text(),
    ).stdout  # fmt: skip
    assert reconnect_times(conf) == {
        "initial-reconnect-time": "30",
        "max-reconnect-time": "3600",
    }


@pytest.mark.parametrize(
    ("initial", "maximum"),
    [("2s", 10), (None, 10), (0, 10), (20, 10)],
    ids=["unit", "null", "zero", "initial_above_max"],
)
def test_wrong_times_stop_the_node(
    peering_nodes: PeeringNodes, tmp_path: Path, initial: object, maximum: object
) -> None:
    """A node with a wrong reconnect time stops at once, and says why."""
    config = json.loads(NODE_A_CONFIG.read_text())
    config["innfeed"] = {
        "initial_reconnect_time": initial,
        "max_reconnect_time": maximum,
    }
    config_file = tmp_path / "config.json"
    config_file.write_text(json.dumps(config))
    result = subprocess.run(  # noqa: S603 - fixed arguments, no shell
        [
            peering_nodes.docker, "run", "--rm",
            "-v", f"{config_file}:/run/secrets/ome_config:ro",
            IMAGE,
        ],
        capture_output=True,
        text=True,
        check=False,
        timeout=60,
    )  # fmt: skip
    assert result.returncode == 1, result.stdout + result.stderr
    assert "innfeed" in result.stderr
