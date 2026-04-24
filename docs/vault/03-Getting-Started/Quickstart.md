---
title: Quickstart
description: Run OME end-to-end in five minutes with docker compose
tags: [getting-started, developer, user]
aliases: [Getting Started, Hello World]
created: 2026-04-19
updated: 2026-04-19
---

# Quickstart

Five minutes, one command, two INN servers, two FastAPI backends, two React
frontends.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) running.
- Ports `119`, `1119`, `5001`, `5002`, `4000`, `4001` free on the host.
- A terminal (no Python toolchain needed for the docker path).

## Run it

```bash
git clone https://github.com/ISKME/Open-Metadata-Exchange
cd Open-Metadata-Exchange
docker compose build
docker compose up
```

Then open:

- <http://localhost:5001> — FastAPI backend + newsgroup overview
- <http://localhost:5001/docs> — Swagger UI (auto‑generated API docs)
- <http://localhost:4000/imls> — React frontend (Austin node)
- <http://localhost:4001/imls> — React frontend (Boston node)

## Watch replication

In a second terminal while `docker compose up` is running:

```bash
PYTHONPATH=. uv run scripts/nntp_sync.py
```

Every five seconds it prints a table of each server's newsgroups and
their article counts. See [[../06-Operations/NNTP Sync]] for what it
actually does.

## Try a plugin end‑to‑end

The QUBES plugin has the most complete import story. See the upstream
`server/plugins/qubes/README.md` for the 15‑step runbook — in short:

1. Fetch the source XML and convert to JSON.
2. Create newsgroups (`scripts/create_newsgroups.py`).
3. Run the bulk importer (`server/plugins/qubes/load_qubes_records_to_nntp.py`).
4. Refresh the frontend to see records appear.
5. Run `nntp_sync.py` to watch them replicate to the Boston server.

## Shut it down

```
Ctrl-C        # stop docker compose up
docker compose down
```

## Next

- Developer track → [[Local Development]]
- Plugin author → [[../05-Plugins/Writing a Plugin]]
- Architecture → [[../02-Architecture/System Architecture]]

## Related

- [[Local Development]]
- [[Running the Frontend]]
- [[../06-Operations/Running INN]]
