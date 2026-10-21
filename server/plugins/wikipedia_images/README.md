# Wikipedia Images
## Open Metadata Exchange (OME) plugin

An OME plugin defines how to import and publish metadata from an Open Education Resources system.

`plugin.py` provides the class that enables OME to understand metadata for images on <https://en.wikipedia.org>.

Data access uses public JSON APIs (no scraping):

* Wikipedia REST API: `https://en.wikipedia.org/api/rest_v1/page/media-list/{title}` lists the images on a page.
* MediaWiki Action API: `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata` returns image URLs, authors, licenses, descriptions, and dates.

Sample dataset: the images on <https://en.wikipedia.org/wiki/French_Polynesia> plus a map of each of the 10 most populated islands (Tahiti, Moorea, Raiatea, Bora Bora, Huahine, Taha'a, Nuku Hiva, Rangiroa, Hiva Oa, Ua Pou). Run `bulk_import.py` to download the images into `wikipedia_images/` and cache the metadata in `wikipedia_images_resources.json`.

| File | Purpose |
|------|---------|
| `plugin.py` | Defines `mimetypes`, `newsgroups`, and translates image metadata into an OME EducationResource. |
| `wikipedia_images_models.py` | Pydantic model for an image record. |
| `bulk_import.py` | Async fetch of image metadata and files via the Wikipedia JSON APIs. |
| `wikipedia_images_item.json` | Sample source record. |
| `wikipedia_images_article.eml` | Sample NNTP article. |

> [!NOTE]
>
> Please ***do NOT edit*** this line and below because when the docs are rebuilt, these lines will be overwritten by scripts/sync_plugin_docs.py.

**MIMETYPES:**
1. application/vnd.wikipedia.images+json

**NEWSGROUPS:**

{'ome.wikipedia_images': 'Metadata from Wikipedia images https://en.wikipedia.org'}
```text
server/plugins/wikipedia_images
├── README.md
├── __init__.py
├── bulk_import.py
├── plugin.py
├── wikipedia_images_article.eml
├── wikipedia_images_item.json
├── wikipedia_images_models.py
└── wikipedia_images_ome_item.json

1 directory, 8 files
```
