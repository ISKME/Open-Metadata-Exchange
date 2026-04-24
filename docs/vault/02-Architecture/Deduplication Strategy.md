---
title: Deduplication Strategy
description: How OME currently deduplicates articles, what's missing, and the plan. Partially answers issue 85.
tags: [architecture, dedup]
aliases: [Dedup]
related: ["[[../09-Decisions/ADR-0003 Deduplication Approach]]"]
created: 2026-04-19
updated: 2026-04-19
---

# Deduplication Strategy

> Partially answers upstream issue
> [iskme/Open-Metadata-Exchange#85](https://github.com/ISKME/Open-Metadata-Exchange/issues/85)
> *"Document our strategy for deduplication — do we need the parent URL,
> children's URL, etc.?"*
>
> This page documents what the code **does today** (derived from source).
> The design questions the ticket raises — cross‑plugin identity,
> parent/child linkage, version relationships — require a human
> decision that source‑reading alone cannot settle. See the open
> questions section.

## TL;DR

| Layer                          | Identity used today                                  | Dedupes?                                         |
|--------------------------------|------------------------------------------------------|--------------------------------------------------|
| **Single INN server**          | `Message-ID` header (INN enforces uniqueness)        | ✅ Within one server                             |
| **Cross‑server replication**   | `Message-ID` compared as a set (`nntp_sync.py`)      | ✅ Never re‑posts an already‑known `Message-ID`  |
| **Re‑import of same resource** | — (new `Message-ID` is generated each post)          | ❌ Produces a duplicate article                  |
| **Same resource from two sources** | — (different plugins, different groups, different IDs) | ❌ No cross‑plugin identity                   |
| **Versions / parents / children** | `source_url` and `version_url` exist on `EducationResource` but no code uses them for dedup | ❌ Not implemented |

## What actually runs today (from source)

### Within one INN server

INN assigns every posted article a unique `Message-ID` when the article is
accepted. Re‑posting the same bytes does **not** create a duplicate —
INN rejects any post whose `Message-ID` is already in its history
database. Uniqueness is guaranteed by the server, not by OME code.

### Across two INN servers

`scripts/nntp_sync.py` implements the peer‑to‑peer replication OME
currently uses (a workaround pending real NNTP peering). The core idea
is a set difference keyed on `Message-ID`:

```python
# scripts/nntp_sync.py:36-41
def get_group_headers(newsgroup, nntp_client):
    _count, first, last, _name = nntp_client.group(newsgroup)
    return {
        header["Message-ID"]: (article_number, header)
        for article_number, header in nntp_client.xover((first, last))
    }

# scripts/nntp_sync.py:78-91
src_articles = get_group_headers(newsgroup, src_client)
dst_articles = get_group_headers(newsgroup, dst_client)
if src_to_dst_articles := set(src_articles) - set(dst_articles):
    article_numbers = sorted(
        article_number
        for message_id, (article_number, header) in src_articles.items()
        if message_id in src_to_dst_articles
    )
    sync_articles(article_numbers, src_client, dst_client)
```

Outcome: any article whose `Message-ID` is already on the destination
server is skipped. Replication is idempotent.

### Re‑import of the same logical resource

Not deduplicated. When a plugin re‑posts the same ERIC record, the
underlying SMTP/NNTP message builder generates a *new* `Message-ID`
(timestamp + host + random), so the destination sees it as a brand‑new
article. The `source_url` field on `EducationResource` has the
information needed to detect this collision, but no code consults it.

### Two sources describing the same resource

Also not deduplicated. If ERIC and OERCommons both catalogue the same
lesson plan, OME today treats them as two unrelated articles in two
unrelated groups. There is no cross‑plugin identity fabric.

## What the data model already supports

`EducationResource` (see [[Data Model]]) already carries two URL fields
that could anchor a richer identity scheme:

- `source_url` — permanent URL to the resource.
- `version_url` — URL to *this* version.

It also carries `last_modified_date`, which gives every version a total
ordering within a single `source_url` namespace.

The aspirational `src/education_resource.py` + `src/pedigree_record.py`
pair models *use* (borrower, borrow date, refreshed dates, usage
comments) but not parent/child / version relationships either.

## Open questions (the issue #85 asks us to settle)

These cannot be answered purely from source. They need a design call:

1. **Canonical identity.** Is it `source_url`? A content hash of the
   OME JSON body? A stable UUID emitted by the origin? Something
   Merkle‑tree‑shaped for verifiable provenance?
2. **Version chains.** If `last_modified_date` changes, do we post a new
   article and link it to the previous (`References:` header), keep one
   article and mutate it (impossible in NNTP — articles are immutable),
   or keep both and have the reader pick the latest?
3. **Parent/child.** What is the relationship the ticket asks about?
   Collections → items? Courses → lessons? A curriculum that references
   another curriculum? Each has a different modelling answer.
4. **Cross‑source identity.** When ERIC and OERCommons describe the
   same lesson, should OME auto‑merge? Or keep them separate and expose
   "probably the same" as a view?
5. **Reconciliation.** Even with good identity, two servers may disagree.
   Do we treat later‑`last_modified_date` as authoritative? Do we
   expose conflicts?

## Proposal (not yet ratified)

- **Primary identity**: content hash of the canonicalised OME JSON body
  (`sha256(model_dump_json(sort_keys=True))`). Include that hash as a
  custom NNTP header (e.g. `X-OME-Content-Hash`) so it travels with the
  article and is visible in `XOVER` without fetching the body.
- **Version linkage**: NNTP's own `References:` header. When a plugin
  detects a known `source_url` with a newer `last_modified_date`, it
  posts a new article whose `References:` points at the previous
  article's `Message-ID`.
- **Parent/child linkage**: custom headers `X-OME-Parent` /
  `X-OME-Children` carrying `Message-ID`s (or `source_url`s when the
  parent is external to OME).
- **Cross‑source collapse**: not automatic. Surface as a UI affordance
  driven by matching `source_url`s.

This becomes [[../09-Decisions/ADR-0003 Deduplication Approach]] once
ratified.

## Pointers in source

- `scripts/nntp_sync.py` — cross‑server dedup loop (what exists today)
- `server/nntp_article.py` — article construction (no dedup logic)
- `server/plugins/ome_plugin.py` — `EducationResource.source_url` /
  `version_url` fields (unused for dedup)
- `src/education_resource.py` + `src/pedigree_record.py` — aspirational
  richer model (has `usage`, no parent/child)

## Related

- [[../09-Decisions/ADR-0003 Deduplication Approach]]
- [[NNTP Backbone]]
- [[Data Model]]
- [[../06-Operations/NNTP Sync]]
