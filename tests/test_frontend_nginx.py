"""
Check the nginx config of the frontend image (server_config/frontend_server).

Starts nginx (the base image of Dockerfile-fe) with that config on a random host port.
Skipped when Docker is not installed.
"""

import shutil
import subprocess
import time
import urllib.error
import urllib.request
from collections.abc import Iterator
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
NGINX_CONFIG = REPO_ROOT / "server_config" / "frontend_server" / "dev" / "etc" / "nginx"
IMAGE = "nginx:latest"  # The same base image as Dockerfile-fe
DOCKER = shutil.which("docker")

pytestmark = [
    pytest.mark.skipif(DOCKER is None, reason="needs Docker"),
    pytest.mark.thread_unsafe,  # one container for the whole module
    pytest.mark.iterations(1),
]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *_args: object) -> None:
        return None  # Raise the 301 as an HTTPError, so the test can read Location


def docker(*args: str) -> str:
    return subprocess.run(  # noqa: S603 - fixed arguments, no shell
        [DOCKER, *args], capture_output=True, text=True, check=True, timeout=120
    ).stdout.strip()


@pytest.fixture(scope="module")
def base_url(tmp_path_factory: pytest.TempPathFactory) -> Iterator[str]:
    site = tmp_path_factory.mktemp("html")
    (site / "imls").mkdir()
    (site / "imls" / "index.html").write_text("<html>OME</html>\n")
    # pytest makes its folders for the owner only; nginx workers run as another user.
    for folder in (site, site / "imls"):
        folder.chmod(0o755)
    container = docker(
        "run", "--detach", "--publish", "127.0.0.1::80",
        # nginx stops when it cannot resolve the API container of the proxy_pass.
        "--add-host", "fastapi-server:127.0.0.1",
        "-v", f"{NGINX_CONFIG}:/etc/nginx:ro",
        "-v", f"{site}:/var/www/html:ro",
        IMAGE,
    )  # fmt: skip
    try:
        port = docker("port", container, "80/tcp").splitlines()[0].rsplit(":", 1)[1]
        url = f"http://127.0.0.1:{port}"
        deadline = time.monotonic() + 30
        while True:
            try:
                urllib.request.urlopen(f"{url}/imls/", timeout=2)  # noqa: S310 - local http URL
                break
            except urllib.error.HTTPError:
                raise  # nginx runs, but answers with an error
            except OSError:  # nginx is not listening yet
                if time.monotonic() > deadline:
                    raise
                time.sleep(0.5)
        yield url
    finally:
        subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [DOCKER, "rm", "--force", container], capture_output=True, check=False
        )


def test_redirect_keeps_the_host_port(base_url: str) -> None:
    """/imls redirects to /imls/ on the port of the browser, not on port 80."""
    opener = urllib.request.build_opener(NoRedirect)
    with pytest.raises(urllib.error.HTTPError) as redirect:
        opener.open(f"{base_url}/imls", timeout=5)
    assert redirect.value.code == 301
    assert redirect.value.headers["Location"] == "/imls/"


def test_app_page_is_served(base_url: str) -> None:
    with urllib.request.urlopen(f"{base_url}/imls/", timeout=5) as response:  # noqa: S310
        assert "OME" in response.read().decode()
