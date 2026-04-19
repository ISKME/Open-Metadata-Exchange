# Prelinger Archives plugin

Imports metadata from the **Prelinger Archives** on the Internet
Archive — <https://archive.org/details/prelinger>.

The Prelinger Archives is a collection of ~60,000 "ephemeral"
(advertising, educational, industrial, and amateur) films held at the
Internet Archive and largely public domain.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.prelinger` |
| Class | `server.plugins.prelinger.plugin.PrelingerPlugin` |

## Supported inputs

See `plugin.py` for the currently implemented `make_metadata_card_*`
methods.

## Data source

The Internet Archive exposes per-item metadata at:

```
https://archive.org/metadata/<identifier>
```

and a search API at:

```
https://archive.org/advancedsearch.php?q=collection:prelinger&output=json
```

## Schema notes

Archive.org records carry heterogeneous fields — `creator`, `subject`,
`date`, `publicdate`, `licenseurl`. Expect missing keys; the plugin
falls back to empty strings for absent string fields.

## Quickstart

```bash
export CMS_PLUGIN=server.plugins.prelinger.plugin.PrelingerPlugin
uv run uvicorn server.main:app --reload --port 5001
```

## Files

```
server/plugins/prelinger/
└── plugin.py
```
