---
title: REST API
description: FastAPI surface — Swagger, ReDoc, OpenAPI JSON
tags: [api, reference]
created: 2026-04-19
updated: 2026-04-19
---

# REST API

The FastAPI backend auto‑generates interactive documentation and a
machine‑readable schema.

| URL                               | Purpose                                  |
|-----------------------------------|------------------------------------------|
| `GET /docs`                       | Swagger UI                               |
| `GET /redoc`                      | ReDoc UI                                 |
| `GET /openapi.json`               | Raw OpenAPI 3 schema                     |

When running locally:

- <http://localhost:5001/docs>
- <http://localhost:5001/redoc>
- <http://localhost:5001/openapi.json>

## Core endpoints

| Endpoint                                            | Purpose                                                 |
|-----------------------------------------------------|---------------------------------------------------------|
| `GET /api/channels`                                 | List active newsgroups + descriptions                   |
| `GET /api/channel/{name}`                           | Summary of one group (total / first / last article)     |
| `GET /api/channel/{name}/cards`                     | Recent articles in the group as parsed cards            |
| `GET /api/channel/{name}/article/{message_id}`      | Fetch a single article (headers, body, enclosures)      |
| `POST /api/post`                                    | Post a new article (authenticated)                      |
| `GET /api/plugins`                                  | Plugins installed on this node                          |
| `GET /api/newsgroups`                               | Plugin → newsgroup catalogue                            |

Endpoint names above are indicative; consult `/docs` at runtime for the
exact routes and schemas — `server/routes/` is the source of truth.

## Code generation

Because `/openapi.json` is a full OpenAPI 3 schema, clients in any
language can be generated without hand‑rolling:

```bash
# TypeScript client
npx openapi-typescript http://localhost:5001/openapi.json \
  -o fe2/src/api/ome.d.ts

# Python client
uvx openapi-python-client generate \
  --url http://localhost:5001/openapi.json
```

## Auth

Currently:

- Read endpoints are unauthenticated.
- `POST /api/post` requires NNTP credentials (`INN_USERNAME` /
  `INN_PASSWORD`) that the FastAPI layer forwards to INN.

Production will grow a proper auth layer — see
[[../06-Operations/Deployment]].

## Related

- [[NNTP Interface]]
- [[../02-Architecture/System Architecture]]
- [[../02-Architecture/Components]]
