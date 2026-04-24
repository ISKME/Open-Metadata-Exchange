---
title: ADR-0002 Plugin Architecture
description: Why each OER source is an in-tree plugin implementing OMEPlugin
tags: [decisions, adr, plugins]
status: accepted
created: 2026-04-19
updated: 2026-04-19
---

# ADR-0002 Plugin Architecture

## Context

Each OER source (ERIC, OERCommons, MERLOT, QUBES, Internet Archive,
Open Education Network, Pressbooks, …) has its own API, its own data
shape, its own rate limits, and its own ideas about what counts as a
"record." OME needs a place for source‑specific translation code to
live.

The translation code needs to:

- turn a source‑native record into an `EducationResource`,
- declare which newsgroup the source writes to,
- be discoverable at runtime so the FastAPI layer can enumerate what
  the node supports,
- be swappable for a "this CMS" context, so a node can publish *its
  own* catalogue.

## Decision

Each source is implemented as a Python plugin under
`server/plugins/<source>/plugin.py`. Every plugin subclasses
`OMEPlugin` (defined in `server/plugins/ome_plugin.py`) and declares a
`newsgroups: MappingProxyType` class attribute. Two discovery paths
exist:

1. `server/get_ome_plugins.py::load_plugin()` loads the *one* plugin
   named by the `CMS_PLUGIN` env var — used by the posting path so a
   node knows which source represents itself.
2. `server/get_ome_plugins.py::get_ome_plugins()` walks
   `server/plugins/*/plugin.py` and loads *all* plugins — used by the
   read path to enumerate groups, descriptions, and capabilities.

## Consequences

### Positive

- Source‑specific logic is quarantined. A bug in the ERIC adapter
  cannot break OERCommons ingestion.
- Onboarding a new source is a contained task — copy an existing
  plugin directory, implement the two or three methods, add an entry
  to the newsgroups dict. See [[../05-Plugins/Writing a Plugin]].
- The `newsgroups` attribute being immutable (`MappingProxyType`)
  means group identity is decided at import time and cannot drift
  across instances.
- A skill at `.github/skills/plugin.md` exists to guide humans and AI
  agents through the authoring process.

### Negative

- Plugins live in‑tree, so adding a source requires a PR rather than
  an install. This is a deliberate trade — it keeps the federation's
  plugin set reviewable — but it slows down experimentation.
- Two discovery paths (`load_plugin` / `get_ome_plugins`) means "which
  one runs when" is a cognitive load for new contributors.
- The `EducationResource` model and the `OMEPlugin` base class are
  coupled; evolving either touches every plugin.

### Neutral

- An aspirational richer model lives at `src/education_resource.py`
  but is not yet wired into the plugin contract. See
  [[../02-Architecture/Data Model]].

## Alternatives considered

- **Installable entry‑point plugins** (like pytest plugins): would
  remove the PR requirement but also remove review; rejected for the
  same reason.
- **A single "mapping config" per source** (YAML or JSON instead of
  Python): works for trivial sources, fails for sources that need
  pagination, auth, or rate‑limit handling. Rejected.
- **No plugin layer** (sources implemented directly in routes):
  rejected as clearly untenable at N sources.

## Related

- [[../02-Architecture/Plugin System]]
- [[../05-Plugins/Plugin System Overview]]
- [[../05-Plugins/Writing a Plugin]]
- [[../05-Plugins/Plugin Registry]]
