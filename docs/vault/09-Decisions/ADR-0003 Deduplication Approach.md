---
title: ADR-0003 Deduplication Approach
description: Proposed deduplication identity + version + parent/child scheme
tags: [decisions, adr, dedup]
status: proposed
created: 2026-04-19
updated: 2026-04-19
---

# ADR-0003 Deduplication Approach

> **Status: Proposed.** This ADR captures the proposal developed in
> [[../02-Architecture/Deduplication Strategy]] and partially answers
> [iskme/Open-Metadata-Exchange#85](https://github.com/ISKME/Open-Metadata-Exchange/issues/85).
> It is not yet ratified — the open questions in that page still need
> a human design call.

## Context

Today OME deduplicates at two layers and fails at three:

| Layer | Works? |
|-------|--------|
| Within one INN server (Message‑ID uniqueness) | ✅ |
| Across two INN servers (`nntp_sync.py` set‑difference) | ✅ |
| Re‑import of the same resource | ❌ new Message‑ID every time |
| Same resource from two sources | ❌ no cross‑plugin identity |
| Versions / parents / children | ❌ not modelled |

`EducationResource.source_url` and `version_url` fields exist but no
code consults them. See [[../02-Architecture/Deduplication Strategy]]
for the source‑level proof.

## Decision (proposed)

Layer a four‑part identity scheme on top of the existing NNTP backbone,
without changing the backbone itself:

1. **Primary identity — content hash.**
   Every posted article carries an `X-OME-Content-Hash` custom header
   equal to `sha256(model_dump_json(ordered))` of the OME JSON body.
   Publishers compute this before posting and check whether the hash
   already exists in the target group (via `XOVER` filter). If yes:
   skip the post.
2. **Version linkage — References header.**
   When a plugin detects a known `source_url` with a newer
   `last_modified_date`, it posts a new article whose `References:`
   header points at the previous article's `Message-ID`. This reuses
   NNTP's own threading mechanism.
3. **Parent/child linkage — custom headers.**
   `X-OME-Parent` and `X-OME-Children` carry `Message-ID`s (or
   `source_url`s when the parent is external). Relationships are
   semantic — collections → items, courses → lessons, curriculum →
   curriculum — and are declared by the publishing plugin.
4. **Cross‑source identity — surfaced, not merged.**
   If two plugins publish the same `source_url` (e.g. because they
   both scrape the same canonical URL), OME does not auto‑merge. The
   FastAPI layer exposes a "probably the same" view keyed on
   `source_url` so consumers can decide.

## Consequences

### Positive

- All identity lives in NNTP headers that travel with the article —
  no external database, no drift between stores.
- `XOVER` already returns custom headers, so hash/parent/version
  lookups don't require fetching bodies.
- Immutability stays intact: a "new version" is a new article; the
  old one remains.
- Cross‑source ambiguity becomes a UI concern, not a silent merge.

### Negative

- Publishers must compute the hash and do an `XOVER`‑filtered check
  before posting. This is a behaviour change in every existing plugin.
- `X-OME-Content-Hash` is not a real standard header; anyone consuming
  OME articles via a generic NNTP client has to know to look for it.
- The `References:` approach produces long threads for frequently
  updated resources. Consumers that only want the latest version need
  to walk the thread.
- Hash canonicalisation rules (field ordering, whitespace, float
  formatting) must be specified once and never change.

### Neutral

- None of this breaks existing articles. Old articles without the
  hash header simply aren't dedup‑checked by new publishers.

## Alternatives considered

- **Stable UUID minted by origin.** Rejected: requires every source to
  cooperate; OME can't control what ERIC or OERCommons emit.
- **Database of content hashes external to INN.** Rejected: adds a
  component that must stay in sync with the spool; loses the "all
  context travels with the article" property.
- **Automatic cross‑source merge.** Rejected: destroys provenance. A
  record from ERIC and a record from OERCommons describing the same
  lesson are not the same record even if they describe the same
  underlying resource.
- **Mutate existing articles on update.** Not possible — NNTP
  articles are immutable by protocol.

## Open questions still not answered

These remain open even after this ADR and should be decided before it
moves from Proposed to Accepted:

1. Canonicalisation rules for the content hash (JSON key order, float
   precision, null vs missing).
2. Whether `X-OME-Parent` carries `Message-ID`s, `source_url`s, or
   both (belt‑and‑braces) for external parents.
3. Whether we mint a "latest pointer" group (e.g. `ome.eric.latest`)
   that is rewritten on every version, or leave "find the latest" to
   consumers.
4. Migration path — do we backfill headers on existing articles (we
   can't, see immutability) or only enforce the scheme on new posts?

## Related

- [[../02-Architecture/Deduplication Strategy]]
- [[../02-Architecture/NNTP Backbone]]
- [[../02-Architecture/Data Model]]
- [[ADR-0001 NNTP as Backbone]]
