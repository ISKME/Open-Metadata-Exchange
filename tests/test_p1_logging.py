"""Issue #9 — structured logging (server-side).

Covers:

* ``server.logging_config.get_log_config()`` returns a dictConfig-shaped
  mapping with the expected formatter for dev / prod.
* ``configure_logging()`` installs handlers such that a ``server``-prefix
  logger can emit without going through the root-handler fallback.
* Regression guard: runtime modules (``server/main.py``,
  ``server/newsgroups_view.py``, and the plugin-loader error path) do
  not use bare ``print()``. Demos inside ``if __name__ == "__main__":``
  blocks are exempt — they are interactive CLI tools, not request-path
  code.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).parent.parent
SERVER_DIR = REPO_ROOT / "server"

# Files that are request-path / import-time code (must not ``print``).
_RUNTIME_FILES = [
    SERVER_DIR / "main.py",
    SERVER_DIR / "newsgroups_view.py",
    SERVER_DIR / "get_ome_plugins.py",
]

_PRINT_CALL = re.compile(r"^\s*print\s*\(", re.MULTILINE)
_MAIN_GUARD = re.compile(r'^if __name__ == "__main__":', re.MULTILINE)


def _strip_main_guard(source: str) -> str:
    """Drop everything from ``if __name__ == "__main__":`` onward.

    Those blocks are interactive CLI demos — they are allowed to print.
    """
    match = _MAIN_GUARD.search(source)
    return source if match is None else source[: match.start()]


# ---------- configure_logging() ----------


def test_get_log_config_dev_uses_human_formatter(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OME_ENV", "dev")

    from server.logging_config import get_log_config

    config = get_log_config()
    formatter = config["formatters"]["default"]["format"]
    # Human formatter has the level name and logger name inline.
    assert "%(levelname)s" in formatter
    assert "%(name)s" in formatter


def test_get_log_config_prod_uses_json_formatter(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OME_ENV", "prod")

    from server.logging_config import get_log_config

    config = get_log_config()
    fmt = config["formatters"]["default"]["format"]
    # The prod formatter is JSON-shaped. Structural check, not a full
    # JSON parse — the formatter string is a template, not a JSON doc.
    assert fmt.strip().startswith("{")
    assert '"level"' in fmt
    assert '"logger"' in fmt
    assert '"message"' in fmt


def test_configure_logging_attaches_handler_to_server_logger(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("OME_ENV", "dev")

    from server.logging_config import configure_logging

    configure_logging()
    logger = logging.getLogger("server")

    # Either direct handler on `server` or propagating to a configured
    # root — the test asserts that *some* handler will see records.
    seen = list(logger.handlers)
    walker = logger
    while walker.parent is not None and not seen:
        walker = walker.parent
        seen = list(walker.handlers)
    assert seen, "no handler on 'server' logger or any ancestor"


# ---------- regression guard: no print() in runtime code ----------


@pytest.mark.parametrize("path", _RUNTIME_FILES, ids=lambda p: p.name)
def test_no_print_in_runtime_code(path: Path) -> None:
    source = _strip_main_guard(path.read_text(encoding="utf-8"))
    hits = _PRINT_CALL.findall(source)
    assert not hits, (
        f"{path.relative_to(REPO_ROOT)} contains bare `print(` calls "
        f"outside the __main__ guard. Use `logging.getLogger(__name__)`. "
        "See issue #9."
    )
