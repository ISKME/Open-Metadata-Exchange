"""Regression guards for the `ty` pre-commit hook — ISKME#237.

These tests pin the shape of the `ty` entry in `.pre-commit-config.yaml`
so that accidental removal of a rule or the hook itself fails CI.

The ignore list reflects the current ty pre-release ruleset: it extends
the set from the upstream issue to account for rule renames
(`non-subscriptable` → `not-subscriptable`) and errors surfaced by newer
ty versions that are out of scope for this initial integration. Ratchet
these off in follow-up PRs as the codebase cleans up.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

CONFIG_PATH = Path(__file__).parent.parent / ".pre-commit-config.yaml"

REQUIRED_IGNORES = frozenset(
    {
        "invalid-argument-type",
        "invalid-assignment",
        "invalid-method-override",
        "invalid-parameter-default",
        "invalid-return-type",
        "no-matching-overload",
        "not-subscriptable",
        "possibly-missing-attribute",
        "unknown-argument",
        "unresolved-attribute",
        "unresolved-global",
        "unresolved-import",
        "unresolved-reference",
        "unsupported-operator",
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


def test_ty_hook_is_declared(ty_hook: dict) -> None:
    assert ty_hook["id"] == "ty"


def test_ty_hook_has_pinned_dependency(ty_hook: dict) -> None:
    deps = ty_hook.get("additional_dependencies", [])
    assert any(d.startswith("ty==") for d in deps), (
        f"ty must be pinned to an exact version in additional_dependencies; got {deps}"
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


@pytest.mark.parametrize("rule", sorted(REQUIRED_IGNORES))
def test_ty_hook_ignores_known_noisy_rule(ty_hook: dict, rule: str) -> None:
    assert f"--ignore={rule}" in ty_hook["args"], (
        f"Expected --ignore={rule} in ty hook args so the current codebase passes; "
        "remove once the underlying issues are fixed."
    )
