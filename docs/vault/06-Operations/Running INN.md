---
title: Running INN
description: Operating the InterNetNews server that stores OME articles
tags: [operations, nntp]
created: 2026-04-19
updated: 2026-04-19
---

# Running InterNetNews

Open Metadata Exchange runs
[InterNetNews (INN)](https://www.isc.org/othersoftware/#INN) as its
article store. The dev image is
[`greenbender/inn-docker`](https://github.com/greenbender/inn-docker).

Docs and config reference:

- <https://www.isc.org/othersoftware/#INN>
- <https://www.eyrie.org/~eagle/software/inn/docs-2.7>
- <https://github.com/cclauss/apt-get-inn2-docker>

## Locally via docker compose

```bash
docker compose up internetnews-server-austin         # port 119
docker compose up internetnews-server-boston         # port 1119
```

Or bring up everything (both INN servers + FastAPI + FE2):

```bash
docker compose up
```

## Config layout

Dev config lives in `server_config/news_server/dev/etc/news/`:

| File                               | Purpose                                                    |
|------------------------------------|------------------------------------------------------------|
| `readers.conf`                     | Who may read; which auth methods                           |
| `incoming.conf`                    | Which peers may feed articles                              |
| `inn-secrets.conf`                 | Salts / secrets (env‑templated in CI)                      |
| `filter/filter_innd.pl`            | Server‑side article filtering                              |
| `filter/filter_nnrpd.pl`           | Reader‑facing filtering                                    |
| `filter/nnrpd_access.pl`           | Access policy                                              |
| `localgroups`                      | Groups created on first boot                               |

A second tree at `server_config/news_server/...` mirrors these for other
environments. See [[../04-Developer-Guide/Repository Layout]].

## Interacting with a running container

```bash
# list active groups
docker exec -it ome-internetnews-server-austin-1 \
  sh -c "getlist active | head"

# manually create a group
docker exec -it ome-internetnews-server-austin-1 \
  sh -c "ctlinnd newgroup ome.eric"

# reload active file after config changes
docker exec -it ome-internetnews-server-austin-1 \
  sh -c "ctlinnd reload active 'ome config reload'"

# tail innd/nnrpd logs
docker compose logs -f internetnews-server-austin
```

## Troubleshooting

| Symptom                                         | Likely cause                                    |
|-------------------------------------------------|-------------------------------------------------|
| `ConnectionRefused: :119`                       | INN container not running                       |
| `441 NEWGROUPS disabled`                        | `readers.conf` blocks that command              |
| `441 Authentication required`                   | Missing `INN_USERNAME` / `INN_PASSWORD` env     |
| Newsgroup appears on Austin but not on Boston   | `nntp_sync.py` not running                      |
| Articles accepted but never readable            | `filter_innd.pl` rejecting them; check logs     |

## Related

- [[../02-Architecture/NNTP Backbone]]
- [[Newsgroup Setup]]
- [[NNTP Sync]]
- [[Deployment]]
