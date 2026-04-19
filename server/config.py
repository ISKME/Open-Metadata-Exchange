"""Runtime configuration helpers for the OME server.

Today this module only holds CORS configuration; keep it small and
focused. Add new config helpers here as we continue retiring hardcoded
defaults scattered across the codebase.

Environment variables
---------------------
``OME_ENV``
    Either ``prod`` or anything else. Only ``prod`` activates the
    strict guards (wildcard refusal, required env vars).

``OME_ALLOWED_ORIGINS``
    Comma-separated list of origins permitted by the FastAPI CORS
    middleware. Whitespace around entries is trimmed and empty entries
    are dropped. In production this must be set and must not be a
    wildcard. See :func:`get_allowed_origins`.
"""

from __future__ import annotations

import os
from typing import Any

__all__ = [
    "InvalidCORSConfigError",
    "get_allowed_origins",
    "get_cors_middleware_kwargs",
    "is_production",
]

# Dev defaults match the local front-end (webpack dev server + static
# mount) and the current Dockerfile EXPOSE values. Kept intentionally
# small.
_DEV_DEFAULT_ORIGINS: tuple[str, ...] = (
    "http://localhost:3000",
    "http://localhost:5001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5001",
)


class InvalidCORSConfigError(RuntimeError):
    """Raised when CORS configuration is unsafe for the current env."""


def is_production() -> bool:
    """True when ``OME_ENV=prod``. Anything else is treated as dev/test."""
    return os.environ.get("OME_ENV", "").strip().lower() == "prod"


def _parse_csv(raw: str) -> list[str]:
    return [part.strip() for part in raw.split(",") if part.strip()]


def get_allowed_origins() -> list[str]:
    """Return the CORS allow-list for this process.

    Resolution order:

    1. ``OME_ALLOWED_ORIGINS`` env var, comma-separated.
    2. In dev only: a small hardcoded localhost default list.

    In production the env var is **required** and may not contain a
    ``*`` wildcard. Violations raise :class:`InvalidCORSConfigError`
    so misconfiguration fails at startup rather than silently
    exposing the API.
    """
    raw = os.environ.get("OME_ALLOWED_ORIGINS", "")
    prod = is_production()

    if not raw.strip():
        if prod:
            msg = (
                "OME_ALLOWED_ORIGINS must be set when OME_ENV=prod. "
                "Provide a comma-separated list of allowed origins "
                "(e.g. https://ome.example.org)."
            )
            raise InvalidCORSConfigError(msg)
        return list(_DEV_DEFAULT_ORIGINS)

    origins = _parse_csv(raw)

    if prod and any(o == "*" for o in origins):
        msg = (
            "OME_ALLOWED_ORIGINS contains a wildcard '*' but OME_ENV=prod. "
            "Wildcards are forbidden in production — list explicit "
            "origins instead."
        )
        raise InvalidCORSConfigError(msg)

    return origins


def get_cors_middleware_kwargs() -> dict[str, Any]:
    """Kwargs suitable for ``FastAPI.add_middleware(CORSMiddleware, ...)``.

    Credentials stay disabled; enable only if and when a credentialed
    flow is introduced — and at that point wildcards become illegal
    per the CORS spec anyway.
    """
    return {
        "allow_origins": get_allowed_origins(),
        "allow_credentials": False,
        "allow_methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["*"],
    }
