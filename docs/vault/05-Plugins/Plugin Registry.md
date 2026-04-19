---
title: Plugin Registry
description: The plugins shipped in this repository and their notable features
tags: [plugin, reference]
created: 2026-04-19
updated: 2026-04-19
---

# Plugin Registry

Current plugins under `server/plugins/` as of 2026‑04‑19.

| Plugin                        | Directory                              | Notable feature                                              |
|-------------------------------|----------------------------------------|--------------------------------------------------------------|
| ERIC                          | `eric/`                                | Reference implementation; bulk CSV → JSON import             |
| Early Learning                | `early_learning/`                      | Web scraping (no API); `httpx` + `BeautifulSoup`             |
| OER Commons                   | `oercommons/`                          | Straight JSON transform                                      |
| Open Library                  | `openlibrary/`                         | Linked metadata (two API calls — Work + Author)              |
| QUBES                         | `qubes/`                               | XML‑to‑JSON conversion; OAI‑PMH source                       |
| WHG (World Historical Gazetteer) | `whg/`                              | Geographic metadata; linked gazetteer entries                |
| Pressbooks Directory          | `pressbooks/`                          | Async pagination (`asyncio.gather`) over WordPress REST      |
| OpenStax                      | `openstax/`                            | Textbook metadata                                            |
| Open Education Network        | `open_education_network/`              | Cross‑institutional OER catalogue                            |
| Prelinger (Internet Archive)  | `prelinger/`                           | Video archive metadata                                       |

## Per‑plugin READMEs

Most plugins have (or are gaining) a `README.md` alongside `plugin.py`.
The in‑flight PR
[iskme/Open-Metadata-Exchange#287](https://github.com/ISKME/Open-Metadata-Exchange/pull/287)
adds READMEs to every plugin directory. Check the corresponding README
for setup notes, API quirks, and known limitations.

## Newsgroup map

See [[../02-Architecture/NNTP Backbone#Newsgroup conventions]] for the
canonical list of `ome.*` groups each plugin publishes to.

## Adding a new one

See [[Writing a Plugin]].

## Related

- [[Plugin System Overview]]
- [[Writing a Plugin]]
- [[../02-Architecture/Plugin System]]
