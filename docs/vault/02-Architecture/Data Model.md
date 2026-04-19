---
title: Data Model
description: The EducationResource and PedigreeRecord schemas that OME exchanges
tags: [architecture, data]
created: 2026-04-19
updated: 2026-04-19
---

# Data Model

## `EducationResource`

The canonical unit OME exchanges. Defined as a Pydantic model in
[`server/plugins/ome_plugin.py`](../../../server/plugins/ome_plugin.py).

| Field                     | Type              | Notes                                                        |
|---------------------------|-------------------|--------------------------------------------------------------|
| `title`                   | `str`             | Resource title                                               |
| `description`             | `str`             | Short description                                            |
| `authors`                 | `list[str]`       | Author names                                                 |
| `authoring_institution`   | `str`             | Publishing institution                                       |
| `subject_tags`            | `list[str]`       | Subject / keyword tags                                       |
| `creation_date`           | `datetime \| None`| Original creation date                                       |
| `last_modified_date`      | `datetime \| None`| Last modification date                                       |
| `source_url`              | `str`             | Permanent URL to the resource (used for provenance, not dedup today) |
| `version_url`             | `str`             | URL to this specific version                                 |
| `spdx_license_expression` | `str`             | SPDX licence identifier (e.g. `CC-BY-4.0`)                   |

All fields default to empty — every plugin is expected to fill in what its
source knows, and leave the rest blank rather than fabricate.

### Serialisation

The article body posted to NNTP is the Pydantic JSON dump of an
`EducationResource`. Two enclosures travel with the article:

1. the original source JSON as retrieved from the OER system, and
2. the OME JSON (same as the body, for explicit typing).

See [[NNTP Backbone]] and [`server/nntp_article.py`](../../../server/nntp_article.py).

## `PedigreeRecord` (aspirational)

A parallel model lives at [`src/pedigree_record.py`](../../../src/pedigree_record.py)
and describes how a resource is *used* after it is borrowed. Fields:

| Field                  | Type              | Notes                                           |
|------------------------|-------------------|-------------------------------------------------|
| `education_resource`   | `EducationResource`| The resource being used                        |
| `borrower`             | `str`             | Person who borrowed it                          |
| `borrower_institution` | `str`             | Their organisation                              |
| `date_borrowed`        | `datetime`        | When                                            |
| `refreshed_dates`      | `list[datetime]`  | Every time it was re‑fetched                    |
| `usage_comments`       | `list[str]`       | Free‑text notes from the borrower               |

> [!note] Not yet wired up
> `PedigreeRecord` is imported by `src/education_resource.py` (the
> aspirational pure model) but is **not** present on the
> `EducationResource` class that plugins actually emit today (that lives
> at `server/plugins/ome_plugin.py` and does not have a `usage` field).
> The two models will need to converge; see
> [[Deduplication Strategy]] and
> [[../09-Decisions/ADR-0003 Deduplication Approach]].

## Two `EducationResource` definitions?

Two Pydantic models in the repo currently share the name
`EducationResource`:

| Location                            | Purpose                                                |
|-------------------------------------|--------------------------------------------------------|
| `server/plugins/ome_plugin.py`      | Used by every plugin today; what gets posted over NNTP |
| `src/education_resource.py`         | Aspirational pure model; richer (has `usage`/pedigree) |

The `src/` version is richer and tracks the `PedigreeRecord` history. The
`server/plugins/` version is what the live code emits. A future ADR
should consolidate the two. See
[[../09-Decisions/ADR-0003 Deduplication Approach]] for why this matters.

## Related

- [[System Architecture]]
- [[NNTP Backbone]]
- [[Deduplication Strategy]]
- [[../05-Plugins/EducationResource Model]]
