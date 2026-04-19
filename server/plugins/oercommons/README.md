# OER Commons plugin

Imports metadata from **ISKME's OER Commons** — <https://oercommons.org>.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.oercommons` |
| Class | `server.plugins.oercommons.plugin.OERCommonsPlugin` |

## Supported inputs

| Method | Notes |
|---|---|
| `make_metadata_card_from_url` / `make_metadata_card_from_json` | See `plugin.py` for current implementation status. |

## Data source

OER Commons exposes item metadata on its public site. The Tampermonkey
helper in `tools/monkeyscript/OERCommons.tampermonkey_script.js`
demonstrates a browser-side export flow that posts items into a
locally running OME instance — useful for proof-of-concept imports.

## Schema notes

Pydantic models are generated into `oercommons_models.py`. Regenerate
these if OER Commons changes the schema of its item payload.

## Quickstart

```bash
export CMS_PLUGIN=server.plugins.oercommons.plugin.OERCommonsPlugin
uv run uvicorn server.main:app --reload --port 5001
```

## Files

```
server/plugins/oercommons/
├── oercommons_models.py
└── plugin.py
```
