# Open Education Network plugin

Imports metadata from the **Open Education Network** — open textbooks
hosted at <https://open.umn.edu/opentextbooks>.

OEN is a University of Minnesota initiative aggregating peer-reviewed
open textbooks from dozens of publishers.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.open_education_network` |
| Class | `server.plugins.open_education_network.plugin.OpenEducationNetworkPlugin` |

## Supported inputs

See `plugin.py` for the currently implemented `make_metadata_card_*`
methods.

## Data source

OEN exposes book metadata on its public site. The plugin scrapes or
consumes the public API as appropriate — see `plugin.py` for
specifics.

## Schema notes

Books carry title, authors, subject, license, and a direct-download
URL. Review ratings and reviewer counts are also present and may be
included in `EducationResource.description`.

## Quickstart

```bash
export CMS_PLUGIN=server.plugins.open_education_network.plugin.OpenEducationNetworkPlugin
uv run uvicorn server.main:app --reload --port 5001
```

## Files

```
server/plugins/open_education_network/
└── plugin.py
```
