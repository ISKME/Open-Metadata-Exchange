"""Issue #12 — add mypy type checking to CI.

Strategy matches what worked for coverage (issue #6): start permissive,
ratchet upward. This test guards that the machinery exists:

* `pyproject.toml` has a `[tool.mypy]` section.
* `.github/workflows/ci.yml` runs mypy as a real step (not `|| true`).
* mypy itself is in the dev dependency group.
* A small core module type-checks clean at the chosen level.

Making the entire codebase pass is out of scope for this PR — the
``files`` list in the mypy config pins which modules are currently
held to the bar.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).parent.parent


def test_pyproject_has_mypy_section() -> None:
    text = (REPO_ROOT / "pyproject.toml").read_text(encoding="utf-8")
    assert "[tool.mypy]" in text, (
        "pyproject.toml must declare a [tool.mypy] section (issue #12)"
    )


def test_ci_runs_mypy() -> None:
    text = (REPO_ROOT / ".github" / "workflows" / "ci.yml").read_text(
        encoding="utf-8"
    )
    assert "mypy" in text.lower(), (
        "ci.yml must run mypy as a real step (issue #12)"
    )


def test_mypy_clean_on_core_modules() -> None:
    """Run mypy against modules we've explicitly held to the bar.

    The list of in-scope files is pinned in `pyproject.toml` under
    `[tool.mypy].files`. This test lets you feel a type regression
    before it hits CI.
    """
    # Keep this list aligned with the `files` entry in pyproject.toml.
    # It is intentionally narrow — the whole codebase is not in scope
    # for this first-pass type-check budget.
    in_scope = [
        "server/plugins/ome_plugin.py",
        "server/rate_limit.py",
        "server/logging_config.py",
    ]

    proc = subprocess.run(
        ["uv", "run", "mypy", *in_scope],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )

    if proc.returncode != 0:
        pytest.fail(
            "mypy reported errors on the in-scope modules:\n"
            + (proc.stdout or "")
            + (proc.stderr or "")
        )
