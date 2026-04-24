---
title: Pre-commit Hooks
description: Every hook configured in .pre-commit-config.yaml and why
tags: [developer, tooling]
created: 2026-04-19
updated: 2026-04-19
---

# Pre‑commit Hooks

Configured in [`.pre-commit-config.yaml`](../../../.pre-commit-config.yaml).
Run with `pre-commit run --all-files` before every commit.

## Hook roster

### [`pre-commit/pre-commit-hooks`](https://github.com/pre-commit/pre-commit-hooks)

Housekeeping hooks: AST parse, trailing whitespace, EOF newline, merge
conflict markers, symlink sanity, JSON/YAML/TOML/XML syntax, private‑key
detection, shebang executability, BOM stripping, and more.

### [`MarcoGorelli/auto-walrus`](https://github.com/MarcoGorelli/auto-walrus)

Rewrites `x = foo(); if x:` → `if x := foo():` where it improves
readability.

### [`codespell-project/codespell`](https://github.com/codespell-project/codespell)

Spell‑checks source and docs. Suppressions live in `pyproject.toml`.

### [`astral-sh/ruff-pre-commit`](https://github.com/astral-sh/ruff-pre-commit)

- `ruff-check` — linter (virtually all rules enabled; exclusions in
  `pyproject.toml`).
- `ruff-format` — formatter.

### [`rvben/rumdl-pre-commit`](https://github.com/rvben/rumdl-pre-commit)

Markdown linter. `rumdl-fmt` is available but not enabled yet.

### [`tox-dev/pyproject-fmt`](https://github.com/tox-dev/pyproject-fmt)

Canonicalises `pyproject.toml` formatting.

### [`abravalheri/validate-pyproject`](https://github.com/abravalheri/validate-pyproject)

Validates `pyproject.toml` against PEP schemas.

### [`astral-sh/uv-pre-commit`](https://github.com/astral-sh/uv-pre-commit)

`uv-lock` — keeps `uv.lock` in sync with `pyproject.toml`.

### `ty` (local hook)

Astral's `ty` Python type checker (pre‑release). Runs
`ty check` with a noisy‑rule ignore list that's ratcheted off over
time. See [[Type Checking with ty]].

## Fix then commit, never `--no-verify`

If a hook fails, fix the underlying issue and commit again. `git commit
--no-verify` is discouraged because the hooks also protect other
contributors (trailing whitespace, private keys, broken `uv.lock`).

## CI parity

CI runs the same hooks via
[`pre-commit.ci`](https://pre-commit.ci). If your local run passes and
CI fails, re‑check `pre-commit clean` and re‑install the hooks.

## Related

- [[Testing]]
- [[Type Checking with ty]]
- [[Contributing]]
