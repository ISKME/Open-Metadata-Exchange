---
title: Home
description: Entry point and Map of Content for the OME documentation vault
tags: [moc, home]
aliases: [Index, MOC, Map of Content]
created: 2026-04-19
updated: 2026-04-19
---

# Open Metadata Exchange

> A decentralised network for exchanging metadata about Open Educational
> Resources (OER), so content discovered in one library can be found,
> subscribed to, and re‑used from any other.

## New here?

- [[01-Overview/What is OME]] — one‑page elevator pitch
- [[01-Overview/Nontechnical Description]] — the library analogy
- [[03-Getting-Started/Quickstart]] — run the whole stack in `docker compose`

## By role

### Developer
- [[03-Getting-Started/Local Development]]
- [[04-Developer-Guide/Contributing]]
- [[04-Developer-Guide/Repository Layout]]
- [[04-Developer-Guide/Testing]]
- [[04-Developer-Guide/Pre-commit Hooks]]
- [[05-Plugins/Writing a Plugin]]

### Plugin author
- [[05-Plugins/Plugin System Overview]]
- [[05-Plugins/EducationResource Model]]
- [[05-Plugins/Writing a Plugin]]
- [[05-Plugins/Plugin Registry]]

### Operator / SRE
- [[06-Operations/Running INN]]
- [[06-Operations/Newsgroup Setup]]
- [[06-Operations/NNTP Sync]]
- [[06-Operations/Deployment]]

### Librarian / end user
- [[08-User-Guide/For Librarians]]
- [[08-User-Guide/For OER Consumers]]
- [[08-User-Guide/Publishing Resources]]

## By topic

### Architecture
- [[02-Architecture/System Architecture]] — components, ports, flow
- [[02-Architecture/Data Model]] — `EducationResource`, `PedigreeRecord`
- [[02-Architecture/NNTP Backbone]] — why NNTP, how articles are addressed
- [[02-Architecture/Plugin System]] — loader, discovery, `CMS_PLUGIN`
- [[02-Architecture/Deduplication Strategy]] — answers [iskme/Open-Metadata-Exchange#85]
- [[02-Architecture/Components]]

### Decision records
- [[09-Decisions/ADR Index]]
- [[09-Decisions/ADR-0001 NNTP as Backbone]]
- [[09-Decisions/ADR-0002 Plugin Architecture]]
- [[09-Decisions/ADR-0003 Deduplication Approach]]

### Reference
- [[07-API-Reference/REST API]]
- [[07-API-Reference/NNTP Interface]]
- [[99-Reference/Glossary]]
- [[99-Reference/External Links]]

## Meta

- [[00-Meta/About the Vault]] — why this vault exists, how it relates to
  existing docs, proposal to make it canonical
- [[00-Meta/Conventions]] — frontmatter schema, tags, link style

## Graph

Open the graph view (`Cmd/Ctrl‑G`) to see how concepts connect. Each section
has its own colour group configured in
[[.obsidian/graph.json|the graph config]].

## Tags

Top‑level tags in this vault:

- `#overview` — narrative framing
- `#architecture` — system & data design
- `#plugin` — per‑plugin pages (`#plugin/eric`, `#plugin/qubes`, …)
- `#operations` — running the system
- `#developer` — contributing & tooling
- `#user` — end‑user guide
- `#adr` — architecture decision records
- `#api` — interface reference

Open the tag pane in the right sidebar to filter.
