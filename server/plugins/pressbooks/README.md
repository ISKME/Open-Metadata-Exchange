# Pressbooks Directory plugin

Imports metadata from the **Pressbooks Directory** of open
textbooks — <https://pressbooks.directory>.

Pressbooks is a self-publishing platform widely used by university
libraries; the Directory aggregates openly-licensed books published
across individual Pressbooks installations.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.pressbooks` |
| Class | `server.plugins.pressbooks.plugin.PressbooksPlugin` |

## Supported inputs

See `plugin.py` for the currently implemented `make_metadata_card_*`
methods.

## Data source

Pressbooks Directory exposes a public REST API listing books, authors,
subjects, and license information. Expect paginated responses.

## Schema notes

Licenses are typically `CC-BY`, `CC-BY-SA`, or `CC-BY-NC`. The plugin
maps the directory's license strings to SPDX expressions.

## Quickstart

```bash
export CMS_PLUGIN=server.plugins.pressbooks.plugin.PressbooksPlugin
uv run uvicorn server.main:app --reload --port 5001
```

## Files

```
server/plugins/pressbooks/
└── plugin.py
```
