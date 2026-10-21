# LibreTexts
## Open Metadata Exchange (OME) plugin

An OME plugin defines how to import and publish metadata from an Open Education Resources system.

This plugin imports book metadata from the [LibreTexts Commons](https://commons.libretexts.org)
catalog, using the public JSON API at <https://commons.libretexts.org/api/v1/commons/catalog>
(e.g. `?searchQuery=Python`).

Sample dataset: `libretexts_python_books.json` (books matching the search term "Python") and
`libretexts_item.json` (one item). These fixtures follow the catalog API schema but were not
fetched from the live API; rerun `bulk_import.py` after deleting the cache to refresh them.

* `plugin.py`: Defines `mimetypes`, `newsgroups`, and a `make_metadata_card()` function that translates LibreTexts data into an OME EducationResource.
* `libretexts_models.py`: Pydantic models for LibreTexts catalog records.
* `bulk_import.py`: Async utilities to fetch LibreTexts books and convert them into OME EducationResources.

> [!NOTE]
>
> Please ***do NOT edit*** this line and below because when the docs are rebuilt, these lines will be overwritten by scripts/sync_plugin_docs.py.

**MIMETYPES:**
1. application/vnd.libretexts.book+json

**NEWSGROUPS:**

{'ome.libretexts': 'Metadata from LibreTexts Commons https://commons.libretexts.org'}
```text
server/plugins/libretexts
├── README.md
├── __init__.py
├── bulk_import.py
├── libretexts_article.eml
├── libretexts_item.json
├── libretexts_models.py
├── libretexts_ome_item.json
├── libretexts_python_books.json
└── plugin.py

1 directory, 9 files
```
