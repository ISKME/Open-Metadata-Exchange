"""Unit tests for ``server.connection_pool`` covering P0 fixes.

Covers issues:

* **#2 Move hardcoded NNTP credentials out of source** — the factory
  must read ``INN_USERNAME`` and ``INN_PASSWORD`` from the environment
  and must refuse to construct a client when they are missing.
* **#4 Connection pool ``__exit__`` swallows exceptions without
  cleanup** — the context manager must *invalidate* (not recycle) a
  connection when an ``NNTPError`` is raised inside the ``with`` block.

These tests do not require a live NNTP server. They use the
global ``NNTPClient`` stub installed by ``tests/conftest.py`` and
monkeypatch ``pond`` for the context-manager tests.
"""

from __future__ import annotations

import importlib
from typing import TYPE_CHECKING, Any

import nntp
import pytest

if TYPE_CHECKING:
    from collections.abc import Iterator


# -----------------------------------------------------------------------
# Issue #2 — credentials come from environment, no hardcoded fallback
# -----------------------------------------------------------------------


@pytest.fixture
def _reload_connection_pool() -> Iterator[Any]:
    """Reload ``server.connection_pool`` so module-level state picks up
    the current environment variables.

    The module computes nothing at import time besides registering the
    factory; the credentials are read inside ``createInstance()``, so a
    reload is only needed if we want to prove the module itself imports
    cleanly under the given env conditions. Kept for future-proofing.
    """
    import server.connection_pool as cp

    yield importlib.reload(cp)


def test_client_factory_reads_credentials_from_env(
    monkeypatch: pytest.MonkeyPatch,
    _reload_connection_pool: Any,
) -> None:
    """``createInstance`` must pass env-driven credentials to NNTPClient."""
    monkeypatch.setenv("INN_SERVER_NAME", "example.test")
    monkeypatch.setenv("INN_USERNAME", "alice")
    monkeypatch.setenv("INN_PASSWORD", "s3cret")

    from server.connection_pool import ClientFactory

    pooled = ClientFactory().createInstance()
    client = pooled.keeped_object

    assert client.host == "example.test"
    assert client.port == 119
    assert client._init_kwargs["username"] == "alice"
    assert client._init_kwargs["password"] == "s3cret"


def test_client_factory_raises_when_username_missing(
    monkeypatch: pytest.MonkeyPatch,
    _reload_connection_pool: Any,
) -> None:
    """Missing ``INN_USERNAME`` is fatal — no silent fallback to 'node'."""
    monkeypatch.delenv("INN_USERNAME", raising=False)
    monkeypatch.setenv("INN_PASSWORD", "x")

    from server.connection_pool import ClientFactory, MissingNNTPCredentialsError

    with pytest.raises(MissingNNTPCredentialsError, match="INN_USERNAME"):
        ClientFactory().createInstance()


def test_client_factory_raises_when_password_missing(
    monkeypatch: pytest.MonkeyPatch,
    _reload_connection_pool: Any,
) -> None:
    """Missing ``INN_PASSWORD`` is fatal — no silent fallback to 'node'."""
    monkeypatch.setenv("INN_USERNAME", "x")
    monkeypatch.delenv("INN_PASSWORD", raising=False)

    from server.connection_pool import ClientFactory, MissingNNTPCredentialsError

    with pytest.raises(MissingNNTPCredentialsError, match="INN_PASSWORD"):
        ClientFactory().createInstance()


def test_client_factory_empty_credentials_are_rejected(
    monkeypatch: pytest.MonkeyPatch,
    _reload_connection_pool: Any,
) -> None:
    """Empty-string credentials are treated as missing."""
    monkeypatch.setenv("INN_USERNAME", "")
    monkeypatch.setenv("INN_PASSWORD", "")

    from server.connection_pool import ClientFactory, MissingNNTPCredentialsError

    with pytest.raises(MissingNNTPCredentialsError):
        ClientFactory().createInstance()


# -----------------------------------------------------------------------
# Issue #4 — __exit__ invalidates the connection on exception
# -----------------------------------------------------------------------


class _FakePooled:
    """Minimal stand-in for ``pond.PooledObject`` used in context-manager
    tests. Tracks whether it was returned to the pool or invalidated."""

    def __init__(self) -> None:
        self._client = nntp.NNTPClient()

    def use(self) -> nntp.NNTPClient:
        return self._client


class _Recorder:
    """Records the lifecycle of a pooled connection.

    Replaces both the module-level ``pond`` (to capture ``borrow`` /
    ``recycle``) and ``factory`` (to capture ``destroy``). A broken
    connection must be *destroyed*, not recycled; that is the invariant
    these tests encode.
    """

    def __init__(self) -> None:
        self.calls: list[str] = []
        self.pooled = _FakePooled()

    # pond surface
    def borrow(self, _factory: Any) -> _FakePooled:
        self.calls.append("borrow")
        return self.pooled

    def recycle(self, _pooled: Any, _factory: Any) -> None:
        self.calls.append("recycle")

    # factory surface
    def destroy(self, _pooled: Any) -> None:
        self.calls.append("destroy")

    def createInstance(self) -> _FakePooled:  # noqa: N802 — match pond API
        return self.pooled

    def validate(self, _pooled: Any) -> bool:
        return True

    def reset(self, pooled: Any) -> Any:
        return pooled


@pytest.fixture
def fake_pond(monkeypatch: pytest.MonkeyPatch) -> _Recorder:
    import server.connection_pool as cp

    rec = _Recorder()
    monkeypatch.setattr(cp, "pond", rec)
    monkeypatch.setattr(cp, "factory", rec)
    return rec


def test_context_manager_recycles_on_clean_exit(
    fake_pond: _Recorder,
) -> None:
    """No exception → connection is returned to the pool (recycle)."""
    from server.connection_pool import ClientContextManager

    with ClientContextManager() as client:
        assert isinstance(client, nntp.NNTPClient)

    assert fake_pond.calls == ["borrow", "recycle"]
    assert "destroy" not in fake_pond.calls


def test_context_manager_destroys_on_nntp_error(
    fake_pond: _Recorder,
) -> None:
    """NNTPError inside the block → connection is destroyed, not recycled."""
    from server.connection_pool import ClientContextManager

    with pytest.raises(nntp.NNTPError), ClientContextManager():
        raise nntp.NNTPError("boom")

    assert "destroy" in fake_pond.calls
    assert "recycle" not in fake_pond.calls


def test_context_manager_destroys_on_os_error(
    fake_pond: _Recorder,
) -> None:
    """Socket / OS errors also indicate an unhealthy connection."""
    from server.connection_pool import ClientContextManager

    with pytest.raises(OSError, match="broken pipe"), ClientContextManager():
        raise OSError("broken pipe")

    assert "destroy" in fake_pond.calls
    assert "recycle" not in fake_pond.calls


def test_context_manager_destroys_on_unrelated_exception(
    fake_pond: _Recorder,
) -> None:
    """Non-connection exceptions should also destroy — we can't prove the
    connection is healthy after an unknown failure, so be conservative."""
    from server.connection_pool import ClientContextManager

    with pytest.raises(ValueError, match="domain"), ClientContextManager():
        raise ValueError("domain")

    assert "destroy" in fake_pond.calls
    assert "recycle" not in fake_pond.calls


def test_context_manager_does_not_suppress_exception(
    fake_pond: _Recorder,  # noqa: ARG001
) -> None:
    """``__exit__`` must return falsy so exceptions propagate."""
    from server.connection_pool import ClientContextManager

    cm = ClientContextManager()
    cm.__enter__()
    suppressed = cm.__exit__(ValueError, ValueError("x"), None)
    assert suppressed is False or suppressed is None
