---
title: Contributing
description: Fork, branch, and PR workflow — plus the tools you'll need
tags: [developer]
created: 2026-04-19
updated: 2026-04-19
---

# Contributing

All interactions follow the project
[Code of Conduct](../../../CODE_OF_CONDUCT.md).

Canonical contributor instructions live in
[`CONTRIBUTING.md`](../../../CONTRIBUTING.md); this page is a vault
companion with extra links and context.

## Tools

| Tool                                                                 | Purpose                         |
|----------------------------------------------------------------------|---------------------------------|
| [`uv`](https://docs.astral.sh/uv)                                    | Python package + project manager|
| [`pre-commit`](https://pre-commit.com)                               | Lint / format hooks             |
| [Docker Desktop](https://www.docker.com/products/docker-desktop)     | Containers                      |

## First‑time setup

```bash
uv --python=3.13 venv
source .venv/bin/activate
uv sync

uv tool install pre-commit      # or: brew install pre-commit
pre-commit install
```

## Fork‑and‑PR workflow

```bash
# on github.com, fork ISKME/Open-Metadata-Exchange to your own account
git clone https://github.com/<you>/Open-Metadata-Exchange
cd Open-Metadata-Exchange
git remote add upstream https://github.com/ISKME/Open-Metadata-Exchange
git remote -v    # origin=your fork, upstream=ISKME

git checkout -b my-change
# … edit …
pre-commit run --all-files
git push -u origin my-change
gh pr create --repo ISKME/Open-Metadata-Exchange
```

Follow the PR conventions in
[`.github/copilot-instructions.md`](../../../.github/copilot-instructions.md).

## House style

- Python 3.13+.
- Pydantic `BaseModel` for all data models.
- `MappingProxyType` for immutable class attributes (Ruff `RUF012`).
- Avoid `str | None` fields where a sensible empty default exists.
- Use `:=` assignment expressions where they clarify control flow.
- No `from __future__ import annotations` in Pydantic files that use
  `datetime` (Ruff `TC003` breaks Pydantic runtime validation).
- Frontend: no `console.log`; use `debug()` — see
  [[Frontend Debug Helper]].

## Related

- [[Repository Layout]]
- [[Testing]]
- [[Pre-commit Hooks]]
- [[Type Checking with ty]]
- [[Frontend Debug Helper]]
- [[../05-Plugins/Writing a Plugin]]
