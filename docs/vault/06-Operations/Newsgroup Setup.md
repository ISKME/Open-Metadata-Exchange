---
title: Newsgroup Setup
description: How OME groups are created and why scripts/create_newsgroups.py exists
tags: [operations, nntp]
created: 2026-04-19
updated: 2026-04-19
---

# Newsgroup Setup

## What creates a group?

Two paths today:

1. **`scripts/create_newsgroups.py`** — reads every installed plugin's
   `newsgroups` dict (via `get_newsgroups_from_plugins()`) and issues
   `ctlinnd newgroup` for each. This is how the full OME group
   catalogue is bootstrapped.
2. **Manual `ctlinnd newgroup`** — fallback when the script fails
   (tracked quirk in the QUBES plugin README).

## Run the script

```bash
docker compose up -d internetnews-server-austin
PYTHONPATH=. uv run scripts/create_newsgroups.py
```

The script prints each group it touches; existing groups are left
alone.

## Manual fallback

If the script reports errors, connect to the container directly:

```bash
docker exec -it ome-internetnews-server-austin-1 \
  sh -c "ctlinnd newgroup ome.eric"
docker exec -it ome-internetnews-server-austin-1 \
  sh -c "ctlinnd newgroup ome.qubes"
# …etc for every ome.* group
```

## When are group names decided?

At plugin import time. Each `OMEPlugin` subclass declares its
`newsgroups` dict as a class attribute using `MappingProxyType(...)`
(immutable). Adding a new group **requires a plugin change**; you
cannot create a new OME group just from ops.

## Verifying

```bash
# on the server
docker exec -it ome-internetnews-server-austin-1 \
  sh -c "getlist active | grep ome."

# via FastAPI
curl http://localhost:5001/api/channels | jq .
```

## Related

- [[Running INN]]
- [[NNTP Sync]]
- [[../02-Architecture/Plugin System]]
- [[../02-Architecture/NNTP Backbone]]
