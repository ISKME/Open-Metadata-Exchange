"""
Helpers for the peering test: run commands on the two INN nodes of compose.yaml.
"""

import subprocess
import time
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

import pytest

COMPOSE_FILE = Path(__file__).parent / "compose.yaml"
NODES = ("node-a", "node-b")
NEWSGROUP = "ome.test"
INN_BIN = "/usr/lib/news/bin"  # grephistory and sm are not on PATH
READY_TIMEOUT = 60  # seconds for innd to accept commands after the container starts
BUILD_TIMEOUT = 900  # seconds for the first image build


def wait_for[T](check: Callable[[], T | None], timeout: float) -> T | None:
    """Call check() every second until it returns a value or the timeout ends."""
    deadline = time.monotonic() + timeout
    while True:
        if (result := check()) is not None:
            return result
        if time.monotonic() >= deadline:
            return None
        time.sleep(1)


def _text(output: bytes | str | None) -> str:
    """Partial output of a timed-out command: TimeoutExpired keeps it as bytes."""
    if isinstance(output, bytes):
        return output.decode(errors="replace")
    return output or ""


@dataclass(frozen=True)
class PeeringNodes:
    """Run Docker Compose commands against the two peering nodes."""

    docker: str

    def compose(
        self,
        *args: str,
        input_text: str | None = None,
        check: bool = True,
        timeout: float = 60,
    ) -> subprocess.CompletedProcess[str]:
        command = [self.docker, "compose", "-f", str(COMPOSE_FILE), *args]
        try:
            result = subprocess.run(  # noqa: S603 - fixed arguments, no shell
                command,
                input=input_text,
                capture_output=True,
                text=True,
                check=False,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired as error:
            # A hanging command counts as a failed attempt, so wait_for keeps
            # waiting and the normal failure message with the logs still shows up.
            result = subprocess.CompletedProcess(
                command,
                returncode=124,  # exit code of timeout(1)
                stdout=_text(error.stdout),
                stderr=f"{_text(error.stderr)}Timed out after {timeout} s\n",
            )
        if check and result.returncode != 0:
            pytest.fail(
                f"Command failed with exit code {result.returncode}: "
                f"{' '.join(command)}\n{result.stdout}{result.stderr}"
            )
        return result

    def exec(
        self,
        node: str,
        *command: str,
        input_text: str | None = None,
        check: bool = True,
    ) -> subprocess.CompletedProcess[str]:
        """Run a command inside a node. -T because pytest has no terminal."""
        return self.compose(
            "exec", "-T", "-e", "NNTPSERVER=localhost", node, *command,
            input_text=input_text,
            check=check,
        )  # fmt: skip

    def is_ready(self, node: str) -> bool | None:
        """True when innd on this node accepts commands, else None (keep waiting)."""
        result = self.exec(node, "ctlinnd", "mode", check=False)
        return True if "Server running" in result.stdout else None

    def wait_ready(self, node: str) -> None:
        """Wait until innd on this node accepts commands, or fail with its logs."""
        if not wait_for(lambda: self.is_ready(node), READY_TIMEOUT):
            logs = self.compose("logs", "--no-color", "--tail", "20", node, check=False)
            pytest.fail(
                f"INN on {node} was not ready within {READY_TIMEOUT} s.\n\n"
                f"{self.diagnostics(node)}\n===== {node}: docker compose logs =====\n"
                f"{logs.stdout}{logs.stderr}"
            )

    def stop(self, node: str) -> None:
        """Stop a node like `docker compose stop`: SIGTERM, then time to shut down."""
        self.compose("stop", node)

    def kill(self, node: str) -> None:
        """Kill a node with SIGKILL, like a power cut: INN gets no time to clean up."""
        self.compose("kill", "--signal", "SIGKILL", node)

    def start(self, node: str) -> None:
        """Start a stopped node again and wait until INN is ready."""
        self.compose("start", node)
        self.wait_ready(node)

    def exit_code(self, node: str) -> int:
        """The exit code of a stopped node: 0 when INN shut down cleanly."""
        result = self.compose("ps", "--all", "--format", "{{.ExitCode}}", node)
        return int(result.stdout.strip())

    def post(self, node: str, message_id: str, subject: str) -> None:
        """Post an article on a node with inews, read from stdin (no shell quoting)."""
        article = (
            f"Newsgroups: {NEWSGROUP}\n"
            f"From: peering-test@{node}.invalid\n"
            f"Subject: {subject}\n"
            f"Message-ID: {message_id}\n"
            "\n"
            f"Posted on {node} by the peering test.\n"
        )
        self.exec(node, "inews", "-h", input_text=article)

    def find(self, node: str, message_id: str) -> str | None:
        """The storage token of the article on this node, or None if it is not there."""
        result = self.exec(node, f"{INN_BIN}/grephistory", message_id, check=False)
        if result.returncode != 0:
            return None
        return result.stdout.strip() or None

    def header(self, node: str, token: str, name: str) -> str:
        """One header of a stored article, read with sm."""
        headers = self.exec(node, f"{INN_BIN}/sm", "-H", token).stdout
        prefix = f"{name}:"
        for line in headers.splitlines():
            if line.startswith(prefix):
                return line.removeprefix(prefix).strip()
        return ""

    def diagnostics(self, *nodes: str) -> str:
        """The innfeed log of the given nodes, to show why an article did not arrive.

        innd itself logs to syslog, which the image does not run, so news.notice
        stays empty. innfeed writes its own log: drop its "queue:" debug noise.
        """
        parts = [self.compose("ps", "--all", check=False).stdout]
        for node in nodes:
            logs = self.exec(
                node,
                "sh", "-c",
                "grep -v ' queue: ' /var/log/news/innfeed.log | tail -n 30",
                check=False,
            )  # fmt: skip
            parts.append(f"===== {node}: innfeed.log =====\n{logs.stdout}{logs.stderr}")
        return "\n".join(parts)
