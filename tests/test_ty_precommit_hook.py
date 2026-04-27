"""Regression guards for the `ty` pre-commit hook — ISKME#237.

These tests pin the shape of the `ty` entry in `.pre-commit-config.yaml`
and the ignore rules in `pyproject.toml [tool.ty.rules]` so that accidental
removal of a rule or the hook itself fails CI.

The ignore list reflects the current ty pre-release ruleset.  Ratchet these
off in follow-up PRs as the codebase cleans up.
"""

from __future__ import annotations

from pathlib import Path

import pytest

try:
    import tomllib
except ImportError:
    import tomli as tomllib  # type: ignore[no-redef]

import yaml

CONFIG_PATH = Path(__file__).parent.parent / ".pre-commit-config.yaml"
PYPROJECT_PATH = Path(__file__).parent.parent / "pyproject.toml"

REQUIRED_IGNORED_RULES = frozenset(
    {
        "invalid-argument-type",
        "invalid-assignment",
        "invalid-return-type",
        "no-matching-overload",
        "not-subscriptable",
        "unresolved-attribute",
        "unresolved-import",
    },
)


@pytest.fixture(scope="module")
def ty_hook() -> dict:
    cfg = yaml.safe_load(CONFIG_PATH.read_text())
    for repo in cfg["repos"]:
        for hook in repo.get("hooks", []):
            if hook.get("id") == "ty":
                return hook
    pytest.fail("No `ty` hook found in .pre-commit-config.yaml")


@pytest.fixture(scope="module")
def ty_rules() -> dict:
    pyproject = tomllib.loads(PYPROJECT_PATH.read_text())
    return pyproject.get("tool", {}).get("ty", {}).get("rules", {})


def test_ty_hook_is_declared(ty_hook: dict) -> None:
    assert ty_hook["id"] == "ty"


def test_ty_hook_has_pinned_dependency(ty_hook: dict) -> None:
    deps = ty_hook.get("additional_dependencies", [])
    ty_deps = [d for d in deps if d.lower().startswith("ty")]
    assert any(d.startswith("ty==") for d in deps), (
        f"ty must be pinned to an exact version in additional_dependencies; got {ty_deps}"
    )


def test_ty_hook_invokes_ty_check(ty_hook: dict) -> None:
    assert ty_hook["entry"] == "ty check"


def test_ty_hook_uses_concise_output(ty_hook: dict) -> None:
    assert "--output-format=concise" in ty_hook["args"]


def test_ty_hook_does_not_pass_filenames(ty_hook: dict) -> None:
    # ty walks the project itself; passing filenames would scope it per-file
    # and miss cross-file inference.
    assert ty_hook.get("pass_filenames") is False


def test_ty_hook_runs_on_python_files_only(ty_hook: dict) -> None:
    assert ty_hook.get("types") == ["python"]


def test_ty_hook_has_no_ignore_args(ty_hook: dict) -> None:
    # Ignore rules live in pyproject.toml [tool.ty.rules], not in hook args.
    ignore_args = [a for a in ty_hook.get("args", []) if a.startswith("--ignore=")]
    assert ignore_args == [], (
        f"--ignore flags should be in pyproject.toml [tool.ty.rules], not hook args; found: {ignore_args}"
    )


@pytest.mark.parametrize("rule", sorted(REQUIRED_IGNORED_RULES))
def test_ty_rule_is_ignored_in_pyproject(ty_rules: dict, rule: str) -> None:
    assert ty_rules.get(rule) == "ignore", (
        f"Expected [tool.ty.rules].{rule} = 'ignore' in pyproject.toml so the "
        "current codebase passes; remove once the underlying issues are fixed."
    )
