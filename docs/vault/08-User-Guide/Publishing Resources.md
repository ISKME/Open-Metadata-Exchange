---
title: Publishing Resources
description: How a resource actually gets posted to OME — from plugin to newsgroup
tags: [user-guide, publishing]
created: 2026-04-19
updated: 2026-04-19
---

# Publishing Resources

OME publishes a record by posting an NNTP article to the newsgroup that
represents the source. There are two ways to trigger this:

1. **Via the FastAPI gateway** — `POST /api/post`, authenticated with
   `INN_USERNAME` / `INN_PASSWORD`. The FastAPI layer calls
   `server/nntp_article.py::nntp_article()` which builds a MIME
   multipart message and hands it to INN.
2. **Via a plugin** — a plugin implementing `OMEPlugin.create_resource()`
   turns a source‑native record (an ERIC API response, an OERCommons
   page, a QUBES JSON document) into an `EducationResource` and posts
   it. See [[../05-Plugins/Writing a Plugin]].

## The posting flow

```
your source record
      │
      ▼
plugin.create_resource(raw) → EducationResource
      │
      ▼
nntp_article(to=<newsgroup>, subject=…, body=<OME JSON>,
             enclosures=[raw source JSON])
      │
      ▼
INN accepts → assigns Message-ID → appears in XOVER
      │
      ▼
nntp_sync (or innfeed in prod) → replicates to peers
```

## What ends up on the wire

The article is a MIME multipart/mixed message with:

- **Body**: the OME JSON (an `EducationResource.model_dump_json(...)`).
- **Enclosure(s)**: the raw source record(s), so nothing is lost.
- **Headers**: standard NNTP (`Newsgroups`, `From`, `Subject`,
  `Message-ID`) plus whatever the builder in `server/nntp_article.py`
  decides to set.

See [[../02-Architecture/NNTP Backbone#Article shape]] for the exact
structure.

## Identity today

Each post gets a fresh `Message-ID` generated at build time. That means
re‑posting the same logical resource produces a duplicate — OME does
not yet detect "I've seen this `source_url` before."

This is the part of
[iskme/Open-Metadata-Exchange#85](https://github.com/ISKME/Open-Metadata-Exchange/issues/85)
that still needs a design decision. The proposal in
[[../02-Architecture/Deduplication Strategy]] would attach a content
hash as a custom header so publishers could detect and skip re‑posts.

## Choosing the newsgroup

Publishers write to the group their plugin declares in its `newsgroups`
dict (a `MappingProxyType` class attribute). Adding a new group
requires a plugin change — see
[[../06-Operations/Newsgroup Setup#When are group names decided]].

## Authentication

Production nodes are expected to gate `POST /api/post` behind a real
auth layer. Today it forwards `INN_USERNAME` / `INN_PASSWORD` to INN,
which enforces its own `readers.conf` allow list.

## Related

- [[For Librarians]]
- [[../05-Plugins/Writing a Plugin]]
- [[../05-Plugins/EducationResource Model]]
- [[../07-API-Reference/REST API]]
- [[../02-Architecture/NNTP Backbone]]
