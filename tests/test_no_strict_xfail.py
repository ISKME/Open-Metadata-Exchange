"""Regression guard for issue #7.

Strict `xfail` markers mask real failures: a test that suddenly starts
passing (because someone fixed the underlying bug) now *fails* CI with
an XPASS, which wastes time; meanwhile, actual regressions in code that
still xfails go undetected.

This test greps the `tests/` tree for `xfail(..., strict=True)` and
fails if any survive. If you genuinely need xfail (e.g. an upstream bug
tracked elsewhere), prefer `@pytest.mark.skipif(...)` with a link to
the tracking issue in the reason.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

TESTS_DIR = Path(__file__).parent

# Matches `strict=True` within an `xfail(...)` call. We tolerate
# whitespace and other kwargs between the opening paren and the flag,
# including inner parens such as `reason="foo()"` (hence the lazy
# bounded `.{0,500}?` rather than `[^)]*`).
_STRICT_XFAIL = re.compile(r"xfail\(.{0,500}?strict\s*=\s*True", re.DOTALL)

# Self-reference: this file talks *about* strict xfail but does not use it.
# We exclude it explicitly so grepping for the phrase in docstrings does
# not trip the guard.
_EXCLUDE = {Path(__file__).resolve()}


@pytest.mark.parametrize(
    "test_file",
    sorted(p for p in TESTS_DIR.rglob("test_*.py") if p.resolve() not in _EXCLUDE),
    ids=lambda p: p.name,
)
def test_no_strict_xfail(test_file: Path) -> None:
    text = test_file.read_text(encoding="utf-8")
    matches = _STRICT_XFAIL.findall(text)
    assert not matches, (
        f"{test_file.relative_to(TESTS_DIR.parent)} contains strict xfail "
        f"markers: {matches}. Prefer skipif with a tracking-issue link. "
        "See issue #7."
    )
