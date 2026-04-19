# Open Library plugin

Imports metadata from the Internet Archive's **Open Library** —
<https://openlibrary.org>.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.openlibrary` |
| Class | `server.plugins.openlibrary.plugin.OpenLibraryPlugin` |

## Supported inputs

Open Library is the canonical example of **linked metadata** in this
repo. A Work (e.g. a book) is one API call; each of its Authors is a
separate API call. The plugin handles that two-step lookup.

## Data source

Open Library serves JSON at stable URLs, e.g.:

```
https://openlibrary.org/works/OL45883W.json
https://openlibrary.org/authors/OL34184A.json
```

Pydantic models are split into two files — one per resource type —
to mirror the two API calls:

- `openlibrary_work_models.py`
- `openlibrary_authors_models.py`

## Schema notes

Works contain references to Authors by key; the plugin follows each
reference. Expect rate limiting when doing bulk imports — be polite.

## Quickstart

```bash
export CMS_PLUGIN=server.plugins.openlibrary.plugin.OpenLibraryPlugin
uv run uvicorn server.main:app --reload --port 5001
```

## Files

```
server/plugins/openlibrary/
├── openlibrary_authors_models.py
├── openlibrary_work_models.py
└── plugin.py
```
