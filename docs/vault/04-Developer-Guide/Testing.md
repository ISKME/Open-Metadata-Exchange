---
title: Testing
description: How to run the Python and JS test suites
tags: [developer, testing]
created: 2026-04-19
updated: 2026-04-19
---

# Testing

## Python (pytest)

```bash
uv run pytest                             # full suite
uv run pytest -x --tb=short               # stop at first failure, short traceback
uv run pytest tests/test_schemas.py       # single file
uv run pytest -k "plugin or schema"       # by keyword
uv run pytest -q                          # quieter output
```

### NNTP‑dependent tests

`tests/test_ome_node.py` and `tests/test_nntp_article.py` connect to an
INN server on `localhost:119`. They fail to *collect* with
`ConnectionRefusedError` if no server is running. Before running them:

```bash
docker compose up -d internetnews-server-austin
```

Or skip them explicitly for a fast local loop:

```bash
uv run pytest --ignore=tests/test_ome_node.py --ignore=tests/test_nntp_article.py
```

### Config regression tests

Some tests pin the shape of `pyproject.toml` and `.pre-commit-config.yaml`
so contributors don't accidentally drop a rule. Example:
`tests/test_ty_precommit_hook.py` pins the `ty` hook structure
(see [[Type Checking with ty]]).

## Frontend (jest)

```bash
cd fe2
npm test                        # full jest run
npm test -- --watch             # watch mode
npm test -- debug.test.ts       # single file
```

## Pre‑commit

```bash
pre-commit run --all-files
pre-commit run ruff-check --all-files        # single hook
```

See [[Pre-commit Hooks]] for the full list.

## What to test

- Every new plugin should have a round‑trip test:
  source JSON → `make_metadata_card_from_json()` → `EducationResource`
  assertions. Most existing plugins do this.
- Every new schema change needs a matching assertion in
  `tests/test_schemas.py`.
- Regression guards: when you tighten a rule, encode the expectation
  as a test that reads the config file (see the ty hook test for a
  template).

## Related

- [[Contributing]]
- [[Pre-commit Hooks]]
- [[Type Checking with ty]]
