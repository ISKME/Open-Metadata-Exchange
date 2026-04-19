---
title: Glossary
description: Terms used in OME and this vault
tags: [reference, glossary]
aliases: [Terms, Definitions]
created: 2026-04-19
updated: 2026-04-19
---

# Glossary

## A

**ADR** — Architecture Decision Record. Short, dated note explaining
*why* an architectural choice was made. See [[../09-Decisions/ADR Index]].

**Article** — A single NNTP message posted to a newsgroup. In OME, an
article is a MIME multipart message whose body is the OME JSON and
whose enclosures are the raw source record(s).

**Austin** — The first dev INN server (`:119`). Paired with Boston.

## B

**Boston** — The second dev INN server (`:1119`). Paired with Austin.

## C

**Card** — A parsed `EducationResource` as returned by
`/api/channel/{name}/cards`. Convenience shape for UIs.

**CMS_PLUGIN** — Env var naming the plugin that represents *this* node
for posting. Consumed by `server/get_ome_plugins.py::load_plugin()`.

**ctlinnd** — INN's control tool. Used to create groups, pause feeds,
and send operational commands to the running server.

## E

**EducationResource** — The OME record schema, defined in
`server/plugins/ome_plugin.py`. Title, description, subject, level,
resource type, URL, licence, dates, language, etc. See
[[../02-Architecture/Data Model]].

## F

**FastAPI gateway** — The HTTP layer (`server/ome_node.py`) that wraps
INN with a REST API and Swagger UI.

**FE2** — The v2 frontend in `fe2/`. React + Vite.

## I

**INN / InterNetNews** — The NNTP server OME uses (via
`greenbender/inn-docker`).

**incoming.conf / innfeed** — INN's peering configuration. Not yet
wired into the OME docker‑compose topology — see
[[../06-Operations/NNTP Sync]].

## L

**load_plugin** — Function in `server/get_ome_plugins.py` that imports
the single plugin named by `CMS_PLUGIN`. Contrast with
`get_ome_plugins`.

## M

**MappingProxyType** — Python stdlib immutable view over a dict. Every
`OMEPlugin.newsgroups` is declared with this, so group identity cannot
mutate at runtime.

**Message-ID** — The unique identifier INN assigns every article.
Today it is OME's only deduplication key — see
[[../02-Architecture/Deduplication Strategy]].

**MOC** — Map of Content. An Obsidian convention for a navigational
index page. [[../Home]] is OME's MOC.

## N

**Newsgroup** — An NNTP topic. In OME, one group per OER source
(`ome.eric`, `ome.oercommons`, …). See
[[../06-Operations/Newsgroup Setup]].

**NNTP** — Network News Transfer Protocol (RFC 3977). OME's federation
substrate. See [[../09-Decisions/ADR-0001 NNTP as Backbone]].

**nntp_sync** — `scripts/nntp_sync.py`, the stand‑in for real NNTP
peering in the dev topology. Runs a set‑difference every 5 s.

## O

**OER** — Open Educational Resources. Openly‑licensed lesson plans,
textbooks, course materials.

**OME** — Open Metadata Exchange. This project.

**OMEPlugin** — Base class every source plugin subclasses. Declares
`newsgroups` and implements `create_resource()`.

## P

**PedigreeRecord** — Field on the *aspirational*
`src/education_resource.py` model. Captures borrower, borrow date,
refreshed dates, usage comments. Not yet wired into the live model.

**pynntp** — The Python NNTP client library OME uses
(`greenbender/pynntp`).

## R

**readers.conf** — INN's access control file. Today's auth story is
"allow list by host."

## S

**source_url** — `EducationResource` field holding the permanent URL
of the resource. Not currently used for dedup, but see the proposal in
[[../09-Decisions/ADR-0003 Deduplication Approach]].

**Spool** — INN's on‑disk article store. Backup is a future concern;
see [[../06-Operations/Deployment]].

## T

**ty** — The type‑checker used in pre‑commit. See
[[../04-Developer-Guide/Type Checking with ty]].

## V

**version_url** — `EducationResource` field meant for the URL of a
specific version. Not currently consulted.

## X

**XOVER** — NNTP command that returns overview headers for a range of
articles. OME's dedup loop and the `/api/channel/{name}/cards` route
both rely on it.
