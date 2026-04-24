---
title: Repository Layout
description: Top-level directories and what each one is for
tags: [developer]
created: 2026-04-19
updated: 2026-04-19
---

# Repository Layout

```
Open-Metadata-Exchange/
├── server/                      ← FastAPI app + NNTP + plugins
│   ├── main.py                  FastAPI entry point
│   ├── ome_node.py              Channel / post / summary API
│   ├── get_ome_plugins.py       Plugin loader + discovery
│   ├── nntp_article.py          Article builder (MIME multipart)
│   ├── connection_pool.py       pynntp client pool
│   ├── routes/                  REST endpoints
│   ├── schemas.py               Pydantic request/response schemas
│   └── plugins/                 One directory per OER source
│       ├── ome_plugin.py        Base OMEPlugin + EducationResource
│       └── <source>/            plugin.py + <source>_models.py …
├── src/                         ← aspirational pure data model
│   ├── education_resource.py
│   └── pedigree_record.py
├── fe2/                         ← React + TypeScript frontend
├── frontend/                    ← legacy React frontend
├── scripts/                     ← CLI utilities (nntp_sync, etc.)
├── server_config/               ← INN / news server config
├── tests/                       ← pytest suites
├── tools/                       ← tampermonkey user‑scripts
├── demo/                        ← standalone demo scripts
├── docs/                        ← Sphinx narrative + autoapi site
│   └── vault/                   ← THIS Obsidian vault
├── index.md                     Sphinx toctree entry
├── README.md
├── CONTRIBUTING.md
├── pyproject.toml
├── docker-compose.yml
├── Dockerfile / Dockerfile-fe
└── uv.lock
```

## Where should X go?

| You want to add…                       | Put it in …                                           |
|----------------------------------------|-------------------------------------------------------|
| A new OER source                       | `server/plugins/<source>/`                            |
| A REST endpoint                        | `server/routes/`                                      |
| A request/response schema              | `server/schemas.py`                                   |
| A one‑off CLI                          | `scripts/`                                            |
| A narrative doc page                   | (existing tree) `docs/` or a plugin README            |
| A vault page                           | `docs/vault/<section>/`                               |
| INN server config                      | `server_config/news_server/<env>/etc/news/`           |
| A pytest                               | `tests/test_<feature>.py`                             |

## Two `server/` vs `src/`?

- `server/` is the running application.
- `src/` is an earlier pure‑model prototype that lives on as a reference
  for where the data model *should* go. See
  [[../02-Architecture/Data Model]] for the live vs aspirational split.

## Related

- [[../02-Architecture/System Architecture]]
- [[../02-Architecture/Components]]
- [[Contributing]]
