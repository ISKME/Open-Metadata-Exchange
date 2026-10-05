# OER Africa

This OME plugin gathers open educational resource (OER) metadata from
[OER Africa](https://www.oerafrica.org) — a continental repository of African OER
operated by the Saide OER Africa programme.

## Search endpoint

```
https://www.oerafrica.org/search/site?search_api_views_fulltext=<query>
```

## REST/JSON API

~OER Africa is built on Drupal and exposes a standard Drupal JSON:API at:~
> ~https://www.oerafrica.org/jsonapi/node/resource~


Example — search for resources related to "Milk":

```
https://www.oerafrica.org/jsonapi/node/resource?filter[fulltext]=Milk&page[limit]=50&sort=-changed
```

The response envelope follows the [JSON:API specification](https://jsonapi.org/):

```json
{
  "data": [ { "type": "node--resource", "id": "...", "attributes": { ... }, ... } ],
  "meta": { "count": 42 }
}
```

### Key `attributes` fields

| Field | Description |
|---|---|
| `title` | Resource title |
| `body.summary` | Plain-text abstract / summary |
| `body.value` | Full HTML description |
| `field_license` | Human-readable license string (e.g. `"CC BY 4.0"`) |
| `field_subjects` | List of subject tags |
| `field_language` | Language of the resource |
| `field_url` | Canonical URL for the resource |
| `created` | ISO-8601 creation timestamp |
| `changed` | ISO-8601 last-modified timestamp |

### Resolved metadata (via `meta` in each data item)

| Field | Description |
|---|---|
| `field_institution_title` | Name of the authoring institution |
| `field_authors_names` | List of author names |

## Sample datasets

- `oer_africa_item.json` — single resource item (search term: "Milk")
- `oer_africa_milk_books.json` — five milk-related OER Africa book records

## Plugin files

| File | Purpose |
|---|---|
| `plugin.py` | `OERAFricaPlugin` class — translates records to `EducationResource` |
| `oer_africa_models.py` | Pydantic models for Drupal JSON:API response |
| `bulk_import.py` | Fetches and caches resources from the live API |

## License mapping

The plugin normalises OER Africa license strings to SPDX expressions:

| OER Africa string | SPDX expression |
|---|---|
| `CC BY 4.0` | `CC-BY-4.0` |
| `CC BY-SA 4.0` | `CC-BY-SA-4.0` |
| `CC BY-NC 4.0` | `CC-BY-NC-4.0` |
| `CC BY-NC-SA 4.0` | `CC-BY-NC-SA-4.0` |
| `CC BY-ND 4.0` | `CC-BY-ND-4.0` |
| `CC BY-NC-ND 4.0` | `CC-BY-NC-ND-4.0` |
| `CC0` | `CC0-1.0` |

> [!NOTE]
>
> Please ***do NOT edit*** this line and below because when the docs are rebuilt, these lines will be overwritten by scripts/sync_plugin_docs.py.

**MIMETYPES:**
1. application/vnd.oer-africa.resource+json

**NEWSGROUPS:**

{'ome.oer_africa': 'Metadata from OER Africa open educational resources https://www.oerafrica.org'}
```text
server/plugins/oer_africa
├── README.md
├── __init__.py
├── bulk_import.py
├── oer_africa_item.json
├── oer_africa_milk_books.json
├── oer_africa_models.py
└── plugin.py

1 directory, 7 files
```
