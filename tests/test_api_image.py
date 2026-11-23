"""
Check that the API image contains its own code (issue #106).

Builds Dockerfile-api on its own and runs it without any mounted folder, as
deploy/compose.yaml does with the published image. The API connects to INN when it
starts, so an INN node built from Dockerfile-nntp runs next to it, as in the compose
files. Skipped when Docker is not installed.
"""

import json
import shutil
import subprocess
import time
import urllib.error
import urllib.request
import uuid
from collections.abc import Iterator
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
TEST_CONFIG = REPO_ROOT / "tests" / "peering" / "node-a.json"  # No real credentials
IMAGE = "ome-api:test-image"
NNTP_IMAGE = "ome-nntp:test-image"
DOCKER = shutil.which("docker")
START_TIMEOUT = 90  # seconds for FastAPI to answer

pytestmark = [
    pytest.mark.skipif(DOCKER is None, reason="needs Docker"),
    pytest.mark.thread_unsafe,  # one container for the whole module
    pytest.mark.iterations(1),
]


def docker(*args: str, timeout: float = 120) -> str:
    return subprocess.run(  # noqa: S603 - fixed arguments, no shell
        [DOCKER, *args], capture_output=True, text=True, check=True, timeout=timeout
    ).stdout.strip()


def get(url: str) -> tuple[int, str]:
    try:
        with urllib.request.urlopen(url, timeout=5) as response:  # noqa: S310 - local URL
            return response.status, response.read().decode()
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode(errors="replace")


def wait_for_inn(container: str) -> None:
    deadline = time.monotonic() + START_TIMEOUT
    while time.monotonic() < deadline:
        mode = subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [DOCKER, "exec", container, "ctlinnd", "mode"],
            capture_output=True, text=True, check=False, timeout=30,
        )  # fmt: skip
        if "Server running" in mode.stdout:
            return
        time.sleep(1)
    pytest.fail("INN did not start next to the API")


@pytest.fixture(scope="module")
def api() -> Iterator[str]:
    """Build the image, run it without mounts, and yield its URL."""
    for dockerfile, tag in (("Dockerfile-api", IMAGE), ("Dockerfile-nntp", NNTP_IMAGE)):
        docker("build", "--quiet", "-f", dockerfile, "-t", tag, str(REPO_ROOT),
               timeout=900)  # fmt: skip
    network = f"ome-api-image-test-{uuid.uuid4().hex[:8]}"
    docker("network", "create", network)
    config = ["-v", f"{TEST_CONFIG}:/run/secrets/ome_config:ro"]
    inn = docker(
        "run", "--detach", "--network", network, "--network-alias", "nntp-server",
        *config, NNTP_IMAGE,
    )  # fmt: skip
    containers = [inn]
    try:
        wait_for_inn(inn)
        container = docker(
            "run", "--detach", "--network", network, "--publish", "127.0.0.1::8000",
            # Only the config, as a secret: no ./server, ./static or ./templates.
            *config, "-e", "INN_SERVER_NAME=nntp-server",  # As the compose files
            IMAGE,
            "uv", "run", "--env-file=.env", "fastapi", "run", "--host=0.0.0.0",
            "--port=8000", "server/main.py",
        )  # fmt: skip
        containers.append(container)
        port = docker("port", container, "8000/tcp").splitlines()[0].rsplit(":", 1)[1]
        url = f"http://127.0.0.1:{port}"
        deadline = time.monotonic() + START_TIMEOUT
        while True:
            try:
                if get(f"{url}/openapi.json")[0] == 200:
                    break
            except OSError:
                pass  # Not listening yet
            if time.monotonic() > deadline:
                logs = subprocess.run(  # noqa: S603 - fixed arguments, no shell
                    [DOCKER, "logs", "--tail", "30", container],
                    capture_output=True, text=True, check=False,
                )  # fmt: skip
                pytest.fail(f"the API did not start:\n{logs.stdout}{logs.stderr}")
            time.sleep(1)
        yield url
    finally:
        for name in containers:
            subprocess.run(  # noqa: S603 - fixed arguments, no shell
                [DOCKER, "rm", "--force", name], capture_output=True, check=False
            )
        subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [DOCKER, "network", "rm", network], capture_output=True, check=False
        )


def test_api_answers_without_mounts(api: str) -> None:
    """The acceptance of #106: /api/list answers 200 with only the image and INN."""
    status, body = get(f"{api}/api/list")
    assert status == 200, body
    assert isinstance(json.loads(body), list)


def test_routes_come_from_the_image(api: str) -> None:
    """FastAPI loads server/main.py from the image: its routes are there."""
    status, body = get(f"{api}/openapi.json")
    assert status == 200
    assert "/api/list" in json.loads(body)["paths"]


def test_static_files_come_from_the_image(api: str) -> None:
    """The start page comes from static/ in the image."""
    status, body = get(f"{api}/")
    assert status == 200
    assert "Open Metadata Exchange" in body


def test_templates_come_from_the_image() -> None:
    """templates/ is in the image (the channel pages need INN, so check the files)."""
    files = docker("run", "--rm", "--entrypoint", "ls", IMAGE, "/app/templates")
    assert "channels.html" in files.split()


def test_no_python_cache_in_the_image() -> None:
    """__pycache__ from the working copy stays out of the image (.dockerignore)."""
    found = docker(
        "run", "--rm", "--entrypoint", "find", IMAGE, "/app", "-name", "__pycache__"
    )
    assert not found, f"Python cache copied into the image: {found}"
