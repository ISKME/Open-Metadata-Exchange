---
title: Type Checking with ty
description: Astral's ty type checker — configuration, ignore list, and ratchet strategy
tags: [developer, tooling, type-checking]
aliases: [ty]
related: ["[[Pre-commit Hooks]]"]
created: 2026-04-19
updated: 2026-04-19
---

# Type Checking with `ty`

Astral's [`ty`](https://github.com/astral-sh/ty) is a Rust‑based Python
type checker (pre‑release). OME uses it as a pre‑commit hook to catch
type errors close to where they're introduced.

Tracks upstream issue
[iskme/Open-Metadata-Exchange#237](https://github.com/ISKME/Open-Metadata-Exchange/issues/237);
addressed in PR
[iskme/Open-Metadata-Exchange#293](https://github.com/ISKME/Open-Metadata-Exchange/pull/293).

## Configuration

Declared as a *local* pre‑commit hook in
[`.pre-commit-config.yaml`](../../../.pre-commit-config.yaml):

```yaml
- repo: local
  hooks:
    - id: ty
      name: ty (astral) — Python type checker
      language: python
      additional_dependencies:
        - ty==0.0.31
      entry: ty check
      args:
        - --ignore=invalid-argument-type
        - --ignore=invalid-assignment
        - --ignore=invalid-method-override
        - --ignore=invalid-parameter-default
        - --ignore=invalid-return-type
        - --ignore=no-matching-overload
        - --ignore=not-subscriptable
        - --ignore=possibly-missing-attribute
        - --ignore=unknown-argument
        - --ignore=unresolved-attribute
        - --ignore=unresolved-global
        - --ignore=unresolved-import
        - --ignore=unresolved-reference
        - --ignore=unsupported-operator
        - --output-format=concise
      pass_filenames: false
      types: [python]
```

Why `language: python` with `additional_dependencies`? There is no
upstream `ty-pre-commit` repo yet
([astral-sh/ty#269](https://github.com/astral-sh/ty/issues/269)), so the
hook installs `ty` into pre‑commit's managed venv instead of pulling
from a shared rev.

Why `pass_filenames: false`? `ty` walks the project itself. Passing
individual files scoped per‑hook would miss cross‑file inference.

## Ignore list

The list above reflects ty `0.0.31`'s ruleset. Rules are ratcheted
**off** in follow‑up PRs as the underlying issues are fixed. A
regression test at `tests/test_ty_precommit_hook.py` pins the shape of
the hook so a rule cannot silently be dropped.

Noteworthy drift from the original upstream ticket:

- `non-subscriptable` was renamed to `not-subscriptable`.
- Newer ty versions surface `invalid-method-override`,
  `no-matching-overload`, `unknown-argument` which were not in the
  ticket's original ignore list.

## Running manually

```bash
uvx --from ty==0.0.31 ty check --output-format=concise
```

Or via pre‑commit:

```bash
uvx pre-commit run ty --all-files
```

## Ratchet strategy

When you fix the underlying issues for a rule:

1. Remove `--ignore=<rule>` from `.pre-commit-config.yaml`.
2. Remove the same entry from `REQUIRED_IGNORES` in
   `tests/test_ty_precommit_hook.py`.
3. Run `uvx pre-commit run ty --all-files` to confirm no regressions.

## Related

- [[Pre-commit Hooks]]
- [[Testing]]
- [[Contributing]]
