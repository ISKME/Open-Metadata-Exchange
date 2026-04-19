---
title: Plugin System
description: How OME discovers plugins, loads CMS_PLUGIN, and aggregates newsgroups
tags: [architecture, plugin]
created: 2026-04-19
updated: 2026-04-19
---

# Plugin System

A plugin teaches OME how to talk to one specific OER source. Each plugin
is a subclass of `OMEPlugin` that declares:

- the **MIME type** it stores source data under (e.g.
  `application/vnd.iskme.eric+json`),
- the **newsgroup(s)** it publishes to (e.g. `ome.eric`), and
- `make_metadata_card_from_*()` methods that translate raw source JSON
  into an [[Data Model|`EducationResource`]].

The base class is in
[`server/plugins/ome_plugin.py`](../../../server/plugins/ome_plugin.py).
The full author's guide is at [[../05-Plugins/Writing a Plugin]].

## Discovery

[`server/get_ome_plugins.py`](../../../server/get_ome_plugins.py) has two
distinct entry points. Both matter.

### `load_plugin()` — active plugin (single)

Reads `CMS_PLUGIN` from the environment and imports exactly one plugin
class. This is the plugin the FastAPI server adopts at startup in
[`server/ome_node.py`](../../../server/ome_node.py) (line 49:
`plugin = load_plugin()`). If `CMS_PLUGIN` is unset it falls back to the
empty base `OMEPlugin`.

```bash
export CMS_PLUGIN="server.plugins.eric.plugin.EricPlugin"
uv run fastapi dev server/main.py
```

### `get_ome_plugins()` — all installed plugins

Walks `server/plugins/*/plugin.py`, imports each, and yields every class
that subclasses `OMEPlugin`. This is how the full newsgroup catalogue is
built:

```python
def get_newsgroups_from_plugins() -> dict[str, str]:
    newsgroups = {}
    for plugin in get_ome_plugins():
        newsgroups.update(plugin.newsgroups)
    return newsgroups
```

FastAPI calls this when it needs to describe what groups exist on the
node (e.g. to render the frontpage newsgroup list).

## Why two paths?

- **`load_plugin()`** is about *posting* — which CMS are we acting on
  behalf of right now? That has to be exactly one.
- **`get_ome_plugins()`** is about *subscribing* — which sources does this
  node know how to understand? That's many.

## Directory convention

```tree
server/plugins/
├── ome_plugin.py                ← base class
├── README.md
└── <plugin_name>/
    ├── __init__.py
    ├── plugin.py                ← required: OMEPlugin subclass
    ├── <name>_models.py         ← required: Pydantic source models
    └── bulk_import.py           ← optional: bulk loader
```

Each `plugin.py` must have a class whose module path is addressable by
dotted name (so `CMS_PLUGIN` can select it). The convention is
`server.plugins.<name>.plugin.<Name>Plugin`.

## Where plugins plug in

1. **Newsgroup catalogue** — `get_newsgroups_from_plugins()` is the union
   of every plugin's `newsgroups` dict.
2. **MIME routing** — articles whose body MIME type matches a plugin's
   `mimetypes` can be round‑tripped through that plugin's
   `make_metadata_card_from_json()`.
3. **Posting** — the active `CMS_PLUGIN` is asked to translate the local
   CMS's output format into an `EducationResource` before posting.

## Registered plugins

See [[../05-Plugins/Plugin Registry]] for the current roster and
per‑source notes.

## Related

- [[System Architecture]]
- [[Data Model]]
- [[../05-Plugins/Plugin System Overview]]
- [[../05-Plugins/Writing a Plugin]]
- [[../05-Plugins/Plugin Registry]]
- [[../09-Decisions/ADR-0002 Plugin Architecture]]
