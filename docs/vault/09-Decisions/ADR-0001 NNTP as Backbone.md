---
title: ADR-0001 NNTP as Backbone
description: Why OME uses NNTP (InterNetNews) as its federation substrate
tags: [decisions, adr, nntp]
status: accepted
created: 2026-04-19
updated: 2026-04-19
---

# ADR-0001 NNTP as Backbone

## Context

OME must federate OER metadata between independent institutions that
don't share infrastructure, don't share a trust root, and don't want to
be locked into a single vendor. Each institution wants to publish its
own catalogue and subscribe to others without being "the hub."

Options considered:

- **Custom HTTPS fan‑out** (every node polls every other node over
  REST).
- **ActivityPub** (the Fediverse substrate behind Mastodon).
- **Matrix** (federated event graph).
- **Kafka or similar message bus**.
- **NNTP / InterNetNews**.

## Decision

OME uses **NNTP**, specifically `greenbender/inn-docker` (an
InterNetNews build in a container), as its federation substrate. Every
OME node runs an INN server. Every OER source is a newsgroup
(`ome.<source>`). Every record is an NNTP article.

## Consequences

### Positive

- NNTP has three decades of production use for exactly this shape —
  distributed store‑and‑forward with store‑once, deliver‑many
  semantics.
- INN is batteries‑included: peering (`innfeed`), access control
  (`readers.conf`), retention policies, history database, immutability,
  and a stable wire protocol (RFC 3977).
- Article immutability gives OME a natural provenance story: once
  published, a record cannot be silently rewritten.
- The data model — messages with headers and MIME bodies — maps
  cleanly to "structured record + raw source attachment."
- Anyone can run a node. The federation has no privileged peer.

### Negative

- NNTP is unfamiliar to most developers; onboarding has a conceptual
  bump.
- Operating INN has more ceremony than running a web app (spool
  management, `ctlinnd`, `readers.conf`).
- INN's default tooling assumes text/plain articles; MIME multipart
  works but is less well‑trodden.
- There is no built‑in authorization scheme richer than "allow list by
  IP / hostname"; production deployments will need to layer auth on top.

### Neutral

- Real peering (`incoming.conf` + `innfeed`) is not yet wired up —
  `scripts/nntp_sync.py` stands in for it in dev. See
  [[../06-Operations/NNTP Sync]].

## Alternatives considered

- **ActivityPub**: good fit for social‑style objects; poor fit for the
  "catalogue record" shape and its strong provenance needs. Matures
  around actors and follows, which aren't our primary concept.
- **Matrix**: heavier runtime, fewer libraries for the "catalogue of
  structured records" pattern.
- **Kafka**: requires a coordinator; federation across independent
  orgs is not its strength.
- **Custom HTTPS fan‑out**: we'd end up reimplementing peering,
  retention, and immutability from scratch.

## Related

- [[../02-Architecture/NNTP Backbone]]
- [[../06-Operations/Running INN]]
- [[../06-Operations/NNTP Sync]]
- [[ADR-0002 Plugin Architecture]]
