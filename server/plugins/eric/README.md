# ERIC plugin

Imports metadata from the US Department of Education's
**Education Resources Information Center** — <https://eric.ed.gov>.

ERIC is the most advanced plugin in the repo — study it when you are
writing a new plugin.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.eric` |
| MIME type | `application/vnd.eric.eric+json` |
| Class | `server.plugins.eric.plugin.EricPlugin` |

## Supported inputs

| Method | Implemented | Notes |
|---|---|---|
| `make_metadata_card_from_json` | ✅ | Parses ERIC's per-document JSON into an `EducationResource`. |
| `make_metadata_card_from_dict` | ✅ | Convenience wrapper around the JSON path. |
| `make_metadata_card_from_url` | ❌ | Not implemented — raises `NotImplementedError`. |

## Data source

ERIC exposes a Solr-style search API. A full response document is
modelled by `eric_models.Model`; an individual record by `ModelItem`.
Bulk ingestion lives in `bulk_import.py`.

## Schema notes

- `author` and `subject` are pipe-delimited (`"Doe, Jane|Smith, John"`);
  the plugin splits them.
- `publicationdateyear` is a year string; the plugin converts it to a
  UTC `datetime` on January 1 of that year.
- `last_modified_date` currently mirrors `creation_date` — TODO in
  `plugin.py`.

## Quickstart

```bash
# Smoke-test parsing of the bundled sample record
PYTHONPATH="." uv run server/plugins/eric/plugin.py
```

## Files

```
server/plugins/eric/
├── bulk_import.py   # Converts ERIC API data into OME EducationalResources
├── eric_models.py   # Pydantic models generated from ERIC JSON schema
├── eric.json        # Sample multi-record response
├── eric_item.json   # Sample single record
└── plugin.py        # The OMEPlugin subclass
```
