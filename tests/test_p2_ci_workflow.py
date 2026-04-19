"""Issue #11 — CI must not mask failures with shell fallbacks.

The frontend job previously suffixed `|| true` on three steps (lint:scss,
lint:ts, unit), which makes CI appear green even when lints or tests
fail. That is indistinguishable from success.

GitHub Actions has a first-class ``continue-on-error: true`` directive
that produces a clearly-marked warning in the UI when a step fails —
still non-blocking but visibly different from a passing step. This
test guards the transition: no `|| true` survives in the workflow.

The coverage gate (`--cov-fail-under=50`) is already enforced — this
test verifies it is still there so nobody removes it by accident.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

CI = Path(__file__).parent.parent / ".github" / "workflows" / "ci.yml"


def _ci_text() -> str:
    return CI.read_text(encoding="utf-8")


def test_ci_has_no_silent_or_true_masks() -> None:
    text = _ci_text()
    # Tolerate `|| npm install` (a real fallback for `npm ci` on the
    # first run), reject every other ``|| true`` style mask.
    masks = re.findall(r"\|\|\s*true\b", text)
    assert not masks, (
        "ci.yml must not mask failures with `|| true` (issue #11). "
        f"Found {len(masks)}. Use `continue-on-error: true` instead."
    )


def test_ci_enforces_coverage_gate() -> None:
    text = _ci_text()
    assert "--cov-fail-under=" in text, (
        "ci.yml must keep the coverage gate step (issue #11 + #6)."
    )


@pytest.mark.parametrize(
    "needle",
    [
        "pytest-cov",  # the plugin the gate step depends on
        "--cov=server",  # the coverage target
    ],
)
def test_ci_coverage_step_dependencies(needle: str) -> None:
    text = _ci_text()
    assert needle in text, f"ci.yml coverage gate must reference {needle!r}"
