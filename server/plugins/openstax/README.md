# OpenStax plugin

Imports metadata from **OpenStax open textbooks** —
<https://openstax.org/subjects/computer-science>.

OpenStax publishes free, peer-reviewed, openly-licensed college
textbooks. The plugin pulls their catalog metadata into OME.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.openstax` |
| Class | `server.plugins.openstax.plugin.OpenStaxPlugin` |

## Supported inputs

See `plugin.py` for the currently implemented `make_metadata_card_*`
methods.

## Data source

OpenStax exposes a JSON feed of subject areas and books. Pydantic
models are in `openstax_models.py`.

## Schema notes

Each book entry carries a canonical URL, title, cover, subject tags,
and a license (typically `CC-BY`). The plugin maps those to the
`EducationResource` fields.

## Quickstart

```bash
export CMS_PLUGIN=server.plugins.openstax.plugin.OpenStaxPlugin
uv run uvicorn server.main:app --reload --port 5001
```

## Files

```
server/plugins/openstax/
├── openstax_models.py
└── plugin.py
```
