---
title: For Librarians
description: What OME offers to librarians and catalogue maintainers
tags: [user-guide, librarian]
aliases: [Librarian Guide]
created: 2026-04-19
updated: 2026-04-19
---

# For Librarians

OME is built on the idea that every catalogue of open educational
resources (OER) should be able to *peer* — publish its own records and
subscribe to everyone else's — rather than live in a silo. If you
maintain such a catalogue, OME is designed for you.

## What you can do with OME

- **Publish** your catalogue as an OME newsgroup (one group per
  source). Any OME node that peers with yours automatically learns
  about new records.
- **Subscribe** to other catalogues (ERIC, OERCommons, MERLOT, QUBES,
  etc.) and see their records alongside your own.
- **Query** across the federation through a single REST API
  (`/api/channels`, `/api/channel/{name}/cards`) without knowing where
  each record originated.
- **Stay in control.** Your records carry *your* source URL and
  license. OME is a transport, not a rights‑holder.

## The mental model

If you know email: OME works like that. Every OER record is a
*message* with structured metadata. Every catalogue is a *group*.
Every OME node is a *mail server*. New records propagate the same way
email does — store‑and‑forward between federated nodes.

If you've used a library federation protocol (Z39.50, OAI‑PMH,
IIIF): OME is in the same family but is push‑based rather than
pull‑based, so subscribers see new records as they're published, not
when the subscriber happens to poll.

## How a record looks

Every record is an [[../02-Architecture/Data Model|EducationResource]]
— title, description, subject, education level, resource type, URL,
license, last‑modified date, and the metadata your catalogue already
collects. OME adds the raw source record as an enclosure, so nothing is
lost in translation.

## What you need to run a node

See [[../06-Operations/Deployment]]. For a test node a single VM is
enough; for production you'll want TLS, peering, and a backup strategy.

## Questions that usually come up

- **"Do I lose control of my records?"** No. Your node decides what to
  publish. Peers can unsubscribe, but they cannot alter what you
  publish. Every article is immutable once posted.
- **"What about licences?"** Each record carries its own licence
  field. OME does not impose a licence on the metadata itself.
- **"How do updates work?"** Today: a new article with a new
  `Message-ID`. See [[../02-Architecture/Deduplication Strategy]] for
  the versioning story.
- **"Can I remove a record?"** Not via OME today. INN supports
  `cancel` messages but OME has not wired them in. This is on the
  roadmap.

## Related

- [[For OER Consumers]]
- [[Publishing Resources]]
- [[../02-Architecture/System Architecture]]
- [[../02-Architecture/Data Model]]
