---
title: Goals and Principles
description: Design goals and architectural principles of OME
tags: [overview]
created: 2026-04-19
updated: 2026-04-19
---

# Goals & Principles

## Goals

| Goal                | What it means in practice                                                                 |
|---------------------|-------------------------------------------------------------------------------------------|
| **Interoperability**| Any OER library can publish and subscribe using one schema (`EducationResource`).         |
| **Standardisation** | Shared subject tags, authorship, licensing — cross‑library search works.                 |
| **Decentralisation**| Metadata is replicated across many peer nodes; no single source of truth.                 |
| **Scalability**     | The network grows by adding peers, not by scaling a central service.                      |
| **Preservation**    | A resource stays discoverable even after its origin shuts down.                           |
| **Opt‑in sharing**  | Libraries publish only what they choose to share.                                         |

## Principles

- **Boring protocols win.** NNTP is 40 years old, battle‑tested, and
  already distributed. See [[../09-Decisions/ADR-0001 NNTP as Backbone]].
- **Plugins, not monoliths.** Each OER source is a plugin. New sources
  should be addable without modifying the core. See
  [[../05-Plugins/Plugin System Overview]].
- **Metadata, not media.** OME replicates *descriptions of* resources,
  with links back to the original. Actual media stays where it is (for
  now — see the IPFS explorations in upstream issues #20 and #21).
- **Agent‑friendly.** Schemas are small, typed, and self‑describing.
  Tooling can generate, validate, and query them.
- **Local first.** A node runs offline, or on a laptop, or in a
  container — no central registration is required.

## Related

- [[What is OME]]
- [[Nontechnical Description]]
- [[../09-Decisions/ADR Index]]
