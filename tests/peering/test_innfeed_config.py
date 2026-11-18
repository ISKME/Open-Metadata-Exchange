"""
Check that the innfeed reconnect times from config.json end up in innfeed.conf.

Skipped by default. Run it with:
    uv run pytest tests/peering -m peering -v
"""

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
