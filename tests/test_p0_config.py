"""Unit tests for ``server.config`` covering the CORS allow-list (P0 #1).

The fix replaces ``allow_origins=[\"*\"]`` with an env-driven list. In
production (``OME_ENV=prod``) the list must be set explicitly and must
not contain a wildcard; in dev / test we allow sensible localhost
defaults.
"""

from __future__ import annotations

import pytest


def test_allowed_origins_parses_csv(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(
        "OME_ALLOWED_ORIGINS",
        "https://a.example, https://b.example ,https://c.example",
    )
    monkeypatch.setenv("OME_ENV", "prod")

    from server.config import get_allowed_origins

    assert get_allowed_origins() == [
        "https://a.example",
        "https://b.example",
        "https://c.example",
    ]


def test_allowed_origins_drops_empty_entries(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "https://a.example,,  ,")
    monkeypatch.setenv("OME_ENV", "prod")

    from server.config import get_allowed_origins

    assert get_allowed_origins() == ["https://a.example"]


def test_allowed_origins_rejects_wildcard_in_prod(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "*")
    monkeypatch.setenv("OME_ENV", "prod")

    from server.config import InvalidCORSConfigError, get_allowed_origins

    with pytest.raises(InvalidCORSConfigError, match="wildcard"):
        get_allowed_origins()


def test_allowed_origins_dev_default_when_unset(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("OME_ALLOWED_ORIGINS", raising=False)
    monkeypatch.setenv("OME_ENV", "dev")

    from server.config import get_allowed_origins

    origins = get_allowed_origins()
    assert any("localhost" in o for o in origins)
    assert "*" not in origins


def test_allowed_origins_prod_without_env_raises(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("OME_ALLOWED_ORIGINS", raising=False)
    monkeypatch.setenv("OME_ENV", "prod")

    from server.config import InvalidCORSConfigError, get_allowed_origins

    with pytest.raises(InvalidCORSConfigError, match="OME_ALLOWED_ORIGINS"):
        get_allowed_origins()


def test_allowed_origins_wildcard_allowed_in_dev(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Explicitly setting '*' in dev is permitted — some local setups
    need it. The guard only fires in prod."""
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "*")
    monkeypatch.setenv("OME_ENV", "dev")

    from server.config import get_allowed_origins

    assert get_allowed_origins() == ["*"]


def test_cors_middleware_kwargs_shape(monkeypatch: pytest.MonkeyPatch) -> None:
    """The helper used by main.py returns safe defaults."""
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "https://a.example")
    monkeypatch.setenv("OME_ENV", "prod")

    from server.config import get_cors_middleware_kwargs

    kwargs = get_cors_middleware_kwargs()
    assert kwargs["allow_origins"] == ["https://a.example"]
    assert kwargs["allow_credentials"] is False
    assert isinstance(kwargs["allow_methods"], list)
    assert isinstance(kwargs["allow_headers"], list)
