"""
Check deploy/compose.yml, the compose file for production nodes.

It reads the file through "docker compose config", so the variables are filled in
as on a real node. Skipped when Docker Compose is not installed.
"""

import json
import os
import shutil
import subprocess
from functools import cache
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
DEPLOY = REPO_ROOT / "deploy"
COMPOSE_FILE = DEPLOY / "compose.yml"
TEST_CONFIG = REPO_ROOT / "tests" / "peering" / "node-a.json"  # No real credentials
NODE_SERVICES = {"nntp-server", "fastapi-server", "imls-react"}
DOCKER = shutil.which("docker")

pytestmark = pytest.mark.skipif(DOCKER is None, reason="needs Docker Compose")


@cache
def compose_config(*args: str, **settings: str) -> dict:
    """The compose file as Docker Compose reads it, with these settings set."""
    env = {k: v for k, v in os.environ.items() if not k.startswith("OME_")}
    env |= {"OME_CONFIG": str(TEST_CONFIG)} | settings
    result = subprocess.run(  # noqa: S603 - fixed arguments, no shell
        [DOCKER, "compose", "-f", COMPOSE_FILE, *args, "config", "--format", "json"],
        capture_output=True, text=True, check=True, env=env, timeout=60,
    )  # fmt: skip
    return json.loads(result.stdout)


def test_only_published_images() -> None:
    services = compose_config()["services"]
    assert set(services) == NODE_SERVICES
    for name, service in services.items():
        assert "build" not in service, f"{name} builds an image"
        assert service["image"].startswith("ghcr.io/odisee-ome-2627/ome-"), name
        assert service["image"].endswith(":stable"), name


def test_registry_and_version_can_be_set() -> None:
    services = compose_config(
        OME_REGISTRY="registry.example.org/ome", OME_VERSION="2026.11.25"
    )["services"]
    assert (
        services["nntp-server"]["image"]
        == "registry.example.org/ome/ome-nntp:2026.11.25"
    )


def test_node_restarts_and_stops_cleanly() -> None:
    services = compose_config()["services"]
    for name, service in services.items():
        assert service["restart"] == "unless-stopped", name
    nntp = services["nntp-server"]
    assert nntp["stop_grace_period"] == "30s"
    assert (
        services["fastapi-server"]["depends_on"]["nntp-server"]["condition"]
        == "service_healthy"
    )
    assert {volume["target"] for volume in nntp["volumes"]} == {
        "/var/lib/news",
        "/var/spool/news",
    }


def test_api_runs_in_production_mode_and_is_not_published() -> None:
    api = compose_config()["services"]["fastapi-server"]
    assert "run" in api["command"]
    assert "dev" not in api["command"]
    assert not api.get("ports"), "the API must only be reachable through the frontend"


def test_watchtower_only_with_the_autoupdate_profile() -> None:
    services = compose_config("--profile", "autoupdate")["services"]
    assert "watchtower" in services
    assert "--label-enable" in services["watchtower"]["command"]
    for name in NODE_SERVICES:
        assert (
            services[name]["labels"]["com.centurylinklabs.watchtower.enable"] == "true"
        ), name


@pytest.mark.parametrize(
    "path", sorted(p for p in DEPLOY.rglob("*") if p.is_file()), ids=str
)
def test_no_password_in_deploy(path: Path) -> None:
    assert "password" not in path.read_text().lower(), f"{path} mentions a password"
