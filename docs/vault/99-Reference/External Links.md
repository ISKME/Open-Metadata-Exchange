---
title: External Links
description: Useful links outside the OME repository
tags: [reference, links]
created: 2026-04-19
updated: 2026-04-19
---

# External Links

## OME project

- [OME GitHub organisation (ISKME)](https://github.com/ISKME/Open-Metadata-Exchange)
- [Issue tracker](https://github.com/ISKME/Open-Metadata-Exchange/issues)
- [Pull requests](https://github.com/ISKME/Open-Metadata-Exchange/pulls)

## Tools this vault assumes

- [Obsidian](https://obsidian.md) — the viewer for this vault. Free,
  local‑first, Markdown‑native.
- [uv](https://github.com/astral-sh/uv) — the Python package /
  environment manager used throughout the repo.
- [Ruff](https://github.com/astral-sh/ruff) — the Python
  linter/formatter.
- [ty](https://github.com/astral-sh/ty) — the type‑checker used in
  pre‑commit.
- [pre-commit](https://pre-commit.com) — hooks framework.

## NNTP ecosystem

- [RFC 3977 — NNTP](https://datatracker.ietf.org/doc/html/rfc3977) —
  the protocol spec.
- [InterNetNews (INN)](https://www.isc.org/othersoftware/#inn) — the
  NNTP server OME uses, via the Docker packaging at
  [greenbender/inn-docker](https://github.com/greenbender/inn-docker).
- [pynntp](https://github.com/greenbender/pynntp) — the Python client
  OME uses.
- [greenbender/inn-docker#26](https://github.com/greenbender/inn-docker/issues/26)
  — the upstream issue that motivated `scripts/nntp_sync.py`.

## OER sources OME integrates with

- [ERIC](https://eric.ed.gov/)
- [OERCommons](https://oercommons.org/)
- [MERLOT](https://www.merlot.org/)
- [QUBES](https://qubeshub.org/)
- [Internet Archive](https://archive.org/)
- [Open Education Network](https://open.umn.edu/opentextbooks/)
- [Pressbooks Directory](https://pressbooks.directory/)

(See [[../05-Plugins/Plugin Registry]] for the full list of plugins
actually in the repo.)

## Related

- [[Glossary]]
- [[../Home]]
