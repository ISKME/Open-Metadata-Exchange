---
title: NNTP Sync
description: scripts/nntp_sync.py — the stand-in for real NNTP peering in the dev topology
tags: [operations, nntp]
created: 2026-04-19
updated: 2026-04-19
---

# NNTP Sync

`scripts/nntp_sync.py` replicates articles between the two dev INN
servers (Austin on `:119`, Boston on `:1119`). It runs every five
seconds, lists `Message-ID`s on both sides, and posts anything that is
on the source but not the destination.

This is a **workaround** for
[greenbender/inn-docker#26](https://github.com/greenbender/inn-docker/issues/26);
production deployments should configure INN‑native peering via
`incoming.conf` and `innfeed`.

## Run

```bash
PYTHONPATH=. uv run scripts/nntp_sync.py
```

Output is a pair of rich tables — one per server — showing each
newsgroup, its description, and `[total, first, last]` article numbers,
refreshed every 5 s.

## What it does (and doesn't) handle

**Handles**:

- Skipping any article whose `Message-ID` already exists on the
  destination (set difference).
- Stripping hop‑by‑hop headers (`Injection-Info`, `Path`, `Xref`)
  before re‑posting.

**Does not handle**:

- Retry / back‑off on transient NNTP errors.
- Conflict resolution (there are none — INN enforces immutability).
- Article *deletion* propagation (both servers happily keep their
  copies forever).
- Cross‑plugin deduplication (see
  [[../02-Architecture/Deduplication Strategy]]).

## Source pointer

`scripts/nntp_sync.py` — in particular the `nntp_sync()` and
`sync_articles()` functions.

## Related

- [[../02-Architecture/NNTP Backbone]]
- [[../02-Architecture/Deduplication Strategy]]
- [[Running INN]]
- [[Deployment]]
