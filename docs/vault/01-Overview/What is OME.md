---
title: What is OME
description: One-page description of the Open Metadata Exchange
tags: [overview]
aliases: [Elevator Pitch, OME]
created: 2026-04-19
updated: 2026-04-19
---

# What is OME?

**Open Metadata Exchange (OME)** is a decentralised network for exchanging
metadata about Open Educational Resources (OER).

Each participating library runs an OME node. A node can:

- **Publish** — translate its own catalogue into a common metadata format
  and post it to a shared NNTP newsgroup.
- **Subscribe** — pull metadata from other participants and surface it in
  its own discovery UI.
- **Preserve** — because metadata is replicated across many servers, a
  resource stays discoverable even if the originating library goes down.

## Goals

- **Interoperability** — one schema (`EducationResource`) that every library
  can emit and consume. See [[../02-Architecture/Data Model]].
- **Standardisation** — shared subject tags, authorship, licensing so
  cross‑library search is possible.
- **Decentralisation** — no single server holds the only copy.
- **Scalability** — the network grows by adding peers, not by scaling a
  central service.

## How

OME reuses a boring, mature, distributed protocol — **NNTP** (the Usenet
protocol) — as its replication layer. Each supported OER source has an
**OME plugin** that translates its catalogue into `EducationResource`
records and posts them as NNTP articles. Other nodes subscribe to the
newsgroups they care about.

See [[../02-Architecture/System Architecture]] for how the pieces connect
and [[../09-Decisions/ADR-0001 NNTP as Backbone]] for why NNTP was chosen.

## Who it's for

- **Librarians / OER curators** — publish your catalogue and consume
  others'. See [[../08-User-Guide/For Librarians]].
- **Platform developers** — integrate OME into your CMS with a plugin.
  See [[../05-Plugins/Writing a Plugin]].
- **Researchers / consumers** — search and re‑use resources from any
  participating library. See [[../08-User-Guide/For OER Consumers]].

## Related

- [[Nontechnical Description]]
- [[Goals and Principles]]
- [[../02-Architecture/System Architecture]]
