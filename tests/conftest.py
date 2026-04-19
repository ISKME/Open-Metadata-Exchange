"""Shared pytest configuration for the OME test suite.

Problem this file solves
------------------------
``server/connection_pool.py`` registers a ``ClientFactory`` with
``least_one=True`` at module import time. That causes ``pond`` to
invoke ``ClientFactory.createInstance()`` eagerly, which opens a real
NNTP socket. On a dev machine without a running INN server, any test
that imports ``server.*`` fails during collection with
``ConnectionRefusedError``.

The fix is narrow and only affects tests:

1. If port 119 on ``INN_SERVER_NAME`` (default ``localhost``) is
   unreachable, we install a harmless stub in place of
   ``nntp.NNTPClient`` so module import succeeds.
2. If the port IS reachable (e.g. the CI workflow starts an ``inn``
   service container), we do nothing and the real client is used.

Individual tests that need deterministic behavior (e.g. raising inside
``ClientContextManager``) still monkeypatch ``pond``/``NNTPClient``
explicitly in the test body. This conftest only guarantees import
succeeds.

Default env vars are also set so ``server.connection_pool`` can read
``INN_USERNAME`` / ``INN_PASSWORD`` without blowing up local runs.
"""

from __future__ import annotations

import os
import socket
from typing import TYPE_CHECKING, Any

import pytest

if TYPE_CHECKING:
    from collections.abc import Iterable

# Provide non-secret test defaults for env-driven credentials.
# Production deployments MUST set these explicitly (see .env.example).
os.environ.setdefault("INN_USERNAME", "node")
os.environ.setdefault("INN_PASSWORD", "node")  # noqa: S105
os.environ.setdefault("INN_SERVER_NAME", "localhost")


def _nntp_port_reachable(host: str, port: int = 119, timeout: float = 0.5) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def _install_nntp_stub() -> None:
    """Replace ``nntp.NNTPClient.__init__`` with a no-op for offline dev.

    We monkeypatch ``__init__`` (not the class) so ``isinstance`` checks
    against ``nntp.NNTPClient`` continue to work for any existing tests.
    """
    import nntp  # imported lazily so we never import it unless needed

    def _stub_init(
        self: Any,
        host: str = "localhost",
        port: int = 119,
        **kwargs: Any,
    ) -> None:
        self.host = host
        self.port = port
        self._init_kwargs = kwargs
        self._stubbed = True

    def _stub_date(self: Any) -> str:
        return "20260101000000"

    def _stub_quit(self: Any) -> None:
        return None

    def _stub_group(self: Any, _name: str) -> tuple[int, int, int, str]:
        return (0, 0, 0, _name)

    nntp.NNTPClient.__init__ = _stub_init  # type: ignore[method-assign]
    nntp.NNTPClient.date = _stub_date  # type: ignore[method-assign]
    nntp.NNTPClient.quit = _stub_quit  # type: ignore[method-assign]
    nntp.NNTPClient.group = _stub_group  # type: ignore[method-assign]


_host = os.environ["INN_SERVER_NAME"]
_NNTP_STUBBED = not _nntp_port_reachable(_host)
if _NNTP_STUBBED:
    _install_nntp_stub()


def pytest_collection_modifyitems(
    config: pytest.Config,  # noqa: ARG001
    items: Iterable[pytest.Item],
) -> None:
    """Skip integration tests that need a live NNTP server when stubbed.

    The existing ``tests/test_ome_node.py`` hits a real INN service. In CI
    the INN service container is running and tests execute normally. On a
    dev laptop without INN, we stub ``NNTPClient`` and those integration
    tests cannot work — mark them skipped so the unit-test suite stays
    green.
    """
    if not _NNTP_STUBBED:
        return
    skip_marker = pytest.mark.skip(
        reason="Requires live NNTP server; port 119 unreachable.",
    )
    for item in items:
        if "test_ome_node.py" in str(item.fspath):
            item.add_marker(skip_marker)

