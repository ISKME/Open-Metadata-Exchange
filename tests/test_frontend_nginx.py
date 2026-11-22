"""
Check the nginx config of the frontend image (server_config/frontend_server):
every link on the start page works through the website, and FastAPI gets the requests.

Starts nginx (the base image of Dockerfile-fe) with that config and the start page,
next to a small stand-in for FastAPI on port 8000 that answers with the path and the
Host header it received.
Skipped when Docker is not installed.
"""

import json
import re
import shutil
import subprocess
import time
import urllib.error
import urllib.request
import uuid
from collections.abc import Callable, Iterator
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
NGINX_CONFIG = REPO_ROOT / "server_config" / "frontend_server" / "dev" / "etc" / "nginx"
START_PAGE = REPO_ROOT / "static" / "index.html"
NGINX_IMAGE = "nginx:latest"  # The same base image as Dockerfile-fe
API_IMAGE = "python:3.13-alpine"
DOCKER = shutil.which("docker")

# Stand-in for FastAPI: answers every GET with the path and the Host header it received.
FAKE_API = """
import http.server, json
class Echo(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({"path": self.path, "host": self.headers["Host"]}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
http.server.ThreadingHTTPServer(("", 8000), Echo).serve_forever()
"""
PING_API = "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/')"

# Paths that FastAPI serves, and that the website must pass on to it.
FASTAPI_PATHS = [
    "/api/list",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/channels",
    "/channel/ome.test",
]

pytestmark = [
    pytest.mark.skipif(DOCKER is None, reason="needs Docker"),
    pytest.mark.thread_unsafe,  # one set of containers for the whole module
    pytest.mark.iterations(1),
]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *_args: object) -> None:
        return None  # Raise the 301 as an HTTPError, so the test can read Location


def docker(*args: str) -> str:
    return subprocess.run(  # noqa: S603 - fixed arguments, no shell
        [DOCKER, *args], capture_output=True, text=True, check=True, timeout=180
    ).stdout.strip()


def get(url: str) -> tuple[int, str]:
    """Status code and body of a GET, also for error codes."""
    try:
        with urllib.request.urlopen(url, timeout=5) as response:  # noqa: S310 - local URL
            return response.status, response.read().decode()
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode(errors="replace")


@pytest.fixture(scope="module")
def site(tmp_path_factory: pytest.TempPathFactory) -> Iterator[str]:
    """Start the stand-in API and nginx on one network; yield the website URL."""
    root = tmp_path_factory.mktemp("html")
    (root / "imls").mkdir()
    (root / "imls" / "index.html").write_text("<html>OME frontend</html>\n")
    shutil.copy(START_PAGE, root / "index.html")
    # pytest makes its folders for the owner only; nginx workers run as another user.
    for path in (
        root,
        root / "imls",
        root / "index.html",
        root / "imls" / "index.html",
    ):
        path.chmod(0o755)

    network = f"ome-nginx-test-{uuid.uuid4().hex[:8]}"
    containers: list[str] = []
    docker("network", "create", network)
    try:
        api = docker(
            "run", "--detach", "--network", network,
            "--network-alias", "fastapi-server",
            API_IMAGE, "python", "-c", FAKE_API,
        )  # fmt: skip
        containers.append(api)
        nginx = docker(
            "run", "--detach", "--network", network, "--publish", "127.0.0.1::80",
            "-v", f"{NGINX_CONFIG}:/etc/nginx:ro",
            "-v", f"{root}:/var/www/html:ro",
            NGINX_IMAGE,
        )  # fmt: skip
        containers.append(nginx)
        port = docker("port", nginx, "80/tcp").splitlines()[0].rsplit(":", 1)[1]
        url = f"http://127.0.0.1:{port}"
        # Wait for each container on its own, so a wrong proxy port fails the tests
        # below with a clear message instead of failing here.
        api_ready = ["exec", api, "python", "-c", PING_API]
        wait_until(lambda: run_ok(*api_ready), "the stand-in API", containers)
        wait_until(lambda: get_or_none(f"{url}/imls/") == 200, "nginx", containers)
        yield url
    finally:
        for container in containers:
            subprocess.run(  # noqa: S603 - fixed arguments, no shell
                [DOCKER, "rm", "--force", container], capture_output=True, check=False
            )
        subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [DOCKER, "network", "rm", network], capture_output=True, check=False
        )


def run_ok(*args: str) -> bool:
    """True when a docker command succeeds."""
    return (
        subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [DOCKER, *args], capture_output=True, check=False, timeout=30
        ).returncode
        == 0
    )


def wait_until(ready: Callable[[], bool], what: str, containers: list[str]) -> None:
    deadline = time.monotonic() + 60
    while not ready():
        if time.monotonic() > deadline:
            pytest.fail(f"{what} did not start:\n" + logs(containers))
        time.sleep(0.5)


def get_or_none(url: str) -> int | None:
    """Status code of a GET, or None while the server does not answer yet."""
    try:
        return get(url)[0]
    except OSError:
        return None


def logs(containers: list[str]) -> str:
    return "\n".join(
        subprocess.run(  # noqa: S603 - fixed arguments, no shell
            [DOCKER, "logs", "--tail", "20", c],
            capture_output=True,
            text=True,
            check=False,
        ).stderr
        for c in containers
    )


def start_page_links() -> list[str]:
    """The links on the start page that stay on this site (they start with /)."""
    return re.findall(r'href="(/[^"]*)"', START_PAGE.read_text())


@pytest.mark.parametrize("link", start_page_links())
def test_start_page_link_works(site: str, link: str) -> None:
    status, body = get(f"{site}{link}")
    assert status == 200, f"{link} on the start page gives {status}: {body[:200]}"


@pytest.mark.parametrize("path", FASTAPI_PATHS)
def test_fastapi_gets_the_request(site: str, path: str) -> None:
    """nginx passes the path on to FastAPI on port 8000, with the browser's Host."""
    status, body = get(f"{site}{path}")
    assert status == 200, f"{path} gives {status}: is FastAPI reached on port 8000?"
    received = json.loads(body)
    assert received["path"] == path
    # FastAPI builds links (url_for) from Host: this site, not fastapi-server.
    assert received["host"] == site.removeprefix("http://")


def test_redirect_keeps_the_host_port(site: str) -> None:
    """/imls redirects to /imls/ on the port of the browser, not on port 80."""
    opener = urllib.request.build_opener(NoRedirect)
    with pytest.raises(urllib.error.HTTPError) as redirect:
        opener.open(f"{site}/imls", timeout=5)
    assert redirect.value.code == 301
    assert redirect.value.headers["Location"] == "/imls/"


def test_frontend_page_is_served(site: str) -> None:
    status, body = get(f"{site}/imls/")
    assert status == 200
    assert "OME frontend" in body


def test_start_page_has_no_fixed_host() -> None:
    """Links to localhost work on one machine and port only: use paths like /imls/."""
    fixed = re.findall(
        r'href="(https?://(?:localhost|127\.0\.0\.1)[^"]*)"', START_PAGE.read_text()
    )
    assert not fixed, f"links with a fixed host on the start page: {fixed}"
