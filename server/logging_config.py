"""Centralized logging configuration (issue #9).

Call :func:`configure_logging` once at application startup. In dev the
formatter is human-readable; in prod it is JSON-shaped so downstream
log aggregators can parse it without extra tooling.

The formatter string is intentionally minimal — no extra libraries,
no ``python-json-logger`` dependency. A ``%`` formatter emitting a
JSON-ish line is sufficient for Datadog / CloudWatch ingestion and
keeps the dependency surface flat.
"""

from __future__ import annotations

import logging
import logging.config
import os
from typing import Any

from server.config import is_production

_HUMAN_FORMAT = "[%(asctime)s] %(levelname)s %(name)s: %(message)s"

# The JSON formatter uses `%`-style substitution so it stays compatible
# with ``logging.Formatter``. Real library-level structured logging
# (contextvars, extra dicts) can be layered on later without changing
# this shape.
_JSON_FORMAT = (
    '{"ts":"%(asctime)s","level":"%(levelname)s",'
    '"logger":"%(name)s","message":"%(message)s"}'
)


def get_log_config() -> dict[str, Any]:
    """Return a ``logging.config.dictConfig``-compatible dict."""
    fmt = _JSON_FORMAT if is_production() else _HUMAN_FORMAT
    level = os.environ.get("OME_LOG_LEVEL", "INFO").upper()
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": fmt,
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "stream": "ext://sys.stdout",
            },
        },
        "loggers": {
            "server": {
                "level": level,
                "handlers": ["console"],
                "propagate": False,
            },
        },
        "root": {
            "level": level,
            "handlers": ["console"],
        },
    }


def configure_logging() -> None:
    """Install the logging config. Idempotent."""
    logging.config.dictConfig(get_log_config())
