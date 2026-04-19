# World Historical Gazetteer plugin

Imports metadata from the **World Historical Gazetteer (WHG)** —
<https://whgazetteer.org>.

WHG is a Pitt-hosted gazetteer of places in world history. Records
are geographic entities with names, coordinates, time spans, and
relationships to other places.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.whg` |
| Class | `server.plugins.whg.plugin.WHGPlugin` |

## Supported inputs

See `plugin.py` for the current set of implemented
`make_metadata_card_*` methods.

## Data source

WHG exposes a JSON API. Pydantic models are generated into
`whg_models.py` — regenerate if upstream schema shifts.

## Schema notes

Place records include `names` arrays (multilingual variants),
`timespans`, and `geometry`. The plugin flattens these into the
`EducationResource` shape used by OME.

## Quickstart

```bash
export CMS_PLUGIN=server.plugins.whg.plugin.WHGPlugin
uv run uvicorn server.main:app --reload --port 5001
```

## Files

```
server/plugins/whg/
├── plugin.py
└── whg_models.py
```
