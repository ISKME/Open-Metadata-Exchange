"""Per-IP rate limiter for the FastAPI app (issue #5).

The limit is configurable via the ``OME_RATE_LIMIT`` environment
variable (e.g. ``"100/minute"`` or ``"10/second;100/minute"``). When
unset a permissive default is used so local development and CI do not
self-throttle.

See also:
    * ``server.main`` — wires ``SlowAPIMiddleware`` in at app init.
    * https://slowapi.readthedocs.io/ — library docs.
"""

from __future__ import annotations

import os

from slowapi import Limiter
from slowapi.util import get_remote_address

# Permissive enough that normal traffic is unaffected, strict enough to
# bound obvious scraping. Tune via ``OME_RATE_LIMIT`` per environment.
DEFAULT_RATE_LIMIT = "1000/minute"


def get_rate_limit() -> str:
    """Return the configured rate-limit string.

    Falls back to ``DEFAULT_RATE_LIMIT`` if ``OME_RATE_LIMIT`` is unset
    or empty.
    """
    raw = os.environ.get("OME_RATE_LIMIT", "").strip()
    return raw or DEFAULT_RATE_LIMIT


def create_limiter() -> Limiter:
    """Build the module-level ``Limiter`` used by ``server.main``.

    ``key_func=get_remote_address`` keys on the client IP (respecting
    any ``X-Forwarded-For`` that upstream proxies add — slowapi handles
    that internally via Starlette's ``request.client``).
    """
    return Limiter(
        key_func=get_remote_address,
        default_limits=[get_rate_limit()],
    )
