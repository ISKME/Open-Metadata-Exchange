---
title: Local Development
description: Native (non-Docker) Python + Node setup for contributors
tags: [getting-started, developer]
created: 2026-04-19
updated: 2026-04-19
---

# Local Development

For when you want faster iteration than full `docker compose up` provides,
or want to attach a debugger.

## Python backend

Prerequisites: [`uv`](https://docs.astral.sh/uv) and Python 3.13+.

```bash
uv --python=3.13 venv
source .venv/bin/activate
uv sync                       # install dependencies
```

Run the FastAPI server against an INN container you started separately:

```bash
docker compose up internetnews-server-austin       # just the NNTP server
uv run fastapi dev --host=0.0.0.0 --port=5001 server/main.py
```

The server auto‑reloads on code changes. Open:

- <http://localhost:5001/docs> — Swagger UI.

## Active plugin

Select which plugin represents "this CMS" at startup:

```bash
export CMS_PLUGIN="server.plugins.eric.plugin.EricPlugin"
uv run fastapi dev server/main.py
```

See [[../02-Architecture/Plugin System]] for the semantics.

## Tests

```bash
uv run pytest -x                     # stop at first failure
uv run pytest tests/test_schemas.py  # single file
uv run pytest -k plugin              # by keyword
```

NNTP‑dependent tests (`tests/test_ome_node.py`, `tests/test_nntp_article.py`)
require a running INN on port 119. Start it with
`docker compose up internetnews-server-austin` first.

## Pre‑commit

```bash
uv tool install pre-commit     # or brew install pre-commit
pre-commit install             # once, in your clone
pre-commit run --all-files     # anytime
```

See [[../04-Developer-Guide/Pre-commit Hooks]] for what each hook does.

## Frontend

Separate page: [[Running the Frontend]].

## Related

- [[Quickstart]]
- [[Running the Frontend]]
- [[../04-Developer-Guide/Contributing]]
- [[../04-Developer-Guide/Repository Layout]]
- [[../04-Developer-Guide/Testing]]
