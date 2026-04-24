---
title: For OER Consumers
description: What OME offers to teachers, learners, and developers consuming OER
tags: [user-guide, consumer]
aliases: [Consumer Guide]
created: 2026-04-19
updated: 2026-04-19
---

# For OER Consumers

If you're building a tool that uses OER — a search interface, a
learning management system, a recommendation engine — OME exposes the
federated catalogue through two surfaces:

1. A JSON REST API ([[../07-API-Reference/REST API]]).
2. Direct NNTP ([[../07-API-Reference/NNTP Interface]]) if you want to
   *be* a peer.

## Typical tasks

### Discover what's available

```bash
curl http://localhost:5001/api/channels | jq .
```

Returns every active newsgroup on the node with its description (e.g.
`ome.eric`, `ome.oercommons`, `ome.merlot`).

### Browse records in one catalogue

```bash
curl "http://localhost:5001/api/channel/ome.eric/cards" | jq .
```

Each card is a parsed [[../02-Architecture/Data Model|EducationResource]]
plus the article's NNTP metadata (message ID, date, sender).

### Fetch a single record

```bash
curl "http://localhost:5001/api/channel/ome.eric/article/<message-id>" | jq .
```

The response includes the OME JSON body *and* the raw source record as
an enclosure — useful when you need fields OME didn't capture.

### Generate a client

The REST API ships a full OpenAPI 3 schema at `/openapi.json`. For any
non‑trivial integration, generate a typed client rather than
hand‑rolling HTTP:

```bash
npx openapi-typescript http://localhost:5001/openapi.json -o ome.d.ts
uvx openapi-python-client generate --url http://localhost:5001/openapi.json
```

## Design notes for integrators

- **Records are immutable.** If metadata changes, a new article appears
  with a later `Date:` header. Your cache can key on `Message-ID` and
  trust that once fetched, the content will not change.
- **Every article carries provenance.** The `source_url`, the
  originating plugin's newsgroup, and the raw source record all travel
  with the OME record. Nothing is black‑boxed.
- **Dedup is a consumer concern today.** See
  [[../02-Architecture/Deduplication Strategy]] — OME does not yet
  collapse cross‑source duplicates, so you may see the same resource
  described under two different newsgroups.
- **Rate limiting exists.** `OME_RATE_LIMIT` governs the FastAPI gateway
  (introduced by PR
  [iskme/Open-Metadata-Exchange#286](https://github.com/ISKME/Open-Metadata-Exchange/pull/286)).
  Plan client backoff accordingly.

## Related

- [[For Librarians]]
- [[Publishing Resources]]
- [[../07-API-Reference/REST API]]
- [[../07-API-Reference/NNTP Interface]]
