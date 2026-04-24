---
title: Deployment
description: Deploying an OME node — dev, two-host, and production shapes
tags: [operations]
status: draft
created: 2026-04-19
updated: 2026-04-19
---

# Deployment

> [!warning] Draft
> Production deployment is not yet codified in the upstream repo. This
> page captures the three `docker-compose` topologies that ship today
> and flags what a production runbook still needs.

## Topologies in the repo

| File                                | Purpose                                                     |
|-------------------------------------|-------------------------------------------------------------|
| `docker-compose.yml`                | Two‑node local dev (Austin + Boston)                        |
| `docker-compose-two-hosts.yml`      | Split Austin/Boston across two physical hosts               |
| `docker-compose-virtual-box.yml`    | VirtualBox‑friendly variant                                 |
| `docker-compose.debug.yml`          | Debug overrides (ports, logging)                            |

Each brings up: 2× INN, 2× FastAPI, 2× FE2.

## Environment variables

| Variable           | Consumed by      | Purpose                                           |
|--------------------|------------------|---------------------------------------------------|
| `CMS_PLUGIN`       | FastAPI          | Which plugin represents "this CMS" for posting    |
| `INN_USERNAME`     | FastAPI, tests   | NNTP auth                                         |
| `INN_PASSWORD`     | FastAPI, tests   | NNTP auth                                         |
| `INN_SERVER_NAME`  | FastAPI          | Which INN host to connect to (set in compose)     |
| `OME_ENV`          | FastAPI          | `dev` / `prod` switch                             |
| `OME_RATE_LIMIT`   | FastAPI          | Rate limiting (introduced by PR #286)             |
| `OME_LOG_LEVEL`    | FastAPI          | Log verbosity                                     |

A sample `.env.example` lives at the repo root (PR
[iskme/Open-Metadata-Exchange#287](https://github.com/ISKME/Open-Metadata-Exchange/pull/287)
expands it).

## What a production deployment still needs

This list is deliberately unchecked — none of these are considered
"done" today:

- [ ] Real NNTP peering (`incoming.conf` + `innfeed`) replacing
  `nntp_sync.py`.
- [ ] TLS termination in front of FastAPI.
- [ ] Secrets management (`inn-secrets.conf` is templated but not
  integrated with a real vault).
- [ ] Backup / restore procedure for the INN spool.
- [ ] Monitoring / alerting (no metrics endpoint today).
- [ ] Multi‑region replication topology design.
- [ ] Access control beyond the basic `readers.conf` allow list.

## Related

- [[Running INN]]
- [[Newsgroup Setup]]
- [[NNTP Sync]]
- [[../02-Architecture/System Architecture]]
