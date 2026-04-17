# OME Skills

## Skill: Create a New Plugin

Use this skill to add a new data source to the Open Metadata Exchange by creating a plugin
in the `server/plugins/` directory.

### What Is a Plugin?

An OME plugin connects an external Open Educational Resources (OER) system to the OME network.
It defines how that source's metadata is stored in InterNetNews (INN) newsgroups and how raw
source data is translated into a standardized `EducationResource` object.

Each plugin lives in its own subdirectory under `server/plugins/` and inherits from
`OMEPlugin` (defined in `server/plugins/ome_plugin.py`).

### Plugin Directory Structure

```tree
server/plugins/
├── ome_plugin.py          ← Base class (do not modify)
├── README.md
└── <plugin_name>/
    ├── __init__.py        ← Optional but recommended
    ├── plugin.py          ← Required: subclass of OMEPlugin
    ├── <name>_models.py   ← Required: one or more Pydantic model files for source data
    └── bulk_import.py     ← Optional: utilities for batch importing data
```

> **Reference implementation**: `server/plugins/eric/` is the most advanced plugin and
> should be used as the primary reference when building a new plugin.

---

### Step-by-Step Instructions

#### 1. Create the plugin directory

```bash
mkdir server/plugins/<plugin_name>
touch server/plugins/<plugin_name>/__init__.py
```

Replace `<plugin_name>` with a short, lowercase name for the data source (e.g., `khan`,
`mit_ocw`, `merlot`).

#### 2. Determine the data access strategy

Before writing any code, check whether the source site exposes a public API:

- **JSON/REST API available** → fetch data with `httpx` and generate Pydantic models from
  a sample response using `datamodel-codegen` (see below).  Prefer
  `httpx.AsyncClient` with `asyncio.gather()` for paginated APIs (see
  [Async / concurrent page fetching](#async--concurrent-page-fetching) below).
- **No public API (Drupal, WordPress, static HTML, etc.)** → use web scraping with
  `httpx` + `BeautifulSoup` (see [Web-scraping variant](#web-scraping-variant) below).

#### 3. Create `<name>_models.py` — Pydantic models for source data

Generate models from a sample JSON response using `datamodel-codegen`:

```bash
uv tool run --from=datamodel-code-generator datamodel-codegen \
    --input <sample_response.json> \
    --input-file-type json \
    --output server/plugins/<plugin_name>/<plugin_name>_models.py
```

The generated file will contain Pydantic `BaseModel` classes that validate and parse the
source API's JSON. Add the standard script header and review the generated types.

> **Important:** Do **not** add `from __future__ import annotations` to Pydantic model files
> that contain `datetime` fields. Ruff rule `TC003` will flag the runtime `datetime` import
> as needing a type-checking-only block, which breaks Pydantic's runtime validation.
> Python 3.13 handles PEP 563-style annotations natively without the future import.

Example structure (`server/plugins/eric/eric_models.py`):

```python
#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = ["pydantic"]
# ///

from pydantic import BaseModel, Field


class ModelItem(BaseModel):
    id: str
    title: str
    description: str
    author: list[str] = []
    subject: list[str] = []
    # ... fields matching the source API response


class Model(BaseModel):
    # Top-level wrapper if the API returns a list or pagination envelope
    docs: list[ModelItem] = []
```

#### 3. Create `plugin.py` — the OMEPlugin subclass

```python
#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = ["pydantic"]
# ///

from types import MappingProxyType

from server.plugins.<plugin_name>.<plugin_name>_models import Model, ModelItem
from server.plugins.ome_plugin import EducationResource, OMEPlugin


class <PluginName>Plugin(OMEPlugin):
    """Plugin for <Source Name> metadata integration."""

    # MIME type for JSON enclosures stored in INN articles.
    # Convention: application/vnd.<org>.<source>+json
    mimetypes: tuple[str, ...] = ("application/vnd.<org>.<source>+json",)

    # INN newsgroup(s) for this source.
    # newsgroups is a dict but make it immutable for safety. `ruff rule RUF012`
    # Convention: ome.<source_name>
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.<source_name>": (
                "Metadata from <Source Name> <https://example.com>"
            ),
        }
    )

    site_name: str = "<Source Name>"
    librarian_contact: str = "contact@example.com"
    logo: str = "https://example.com/logo.png"

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        item = ModelItem.model_validate_json(json_payload)
        return self._make_metadata_card(item)

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a Python dict."""
        return self._make_metadata_card(ModelItem(**doc_dict))

    def _make_metadata_card(self, item: ModelItem) -> EducationResource:
        # Map source model fields to EducationResource — adapt names to match your model.
        return EducationResource(
            title=item.title,
            description=item.description,
            authors=item.author,          # adapt: e.g. item.author, item.authors
            authoring_institution=item.publisher or "",  # adapt to source field
            subject_tags=item.subject,    # adapt: e.g. item.subject, item.keywords
            creation_date=item.publicationdateyear,  # adapt to source date field
            last_modified_date=item.publicationdateyear,  # adapt to source field
            source_url=item.url or "",
        )


if __name__ == "__main__":
    plugin = <PluginName>Plugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }")
```

**Key conventions:**

- Inherit from `OMEPlugin`.
- Define `mimetypes` as a `tuple[str, ...]`.
- Define `newsgroups` as `MappingProxyType({...})` (required by `ruff rule RUF012`).
- Implement `make_metadata_card_from_json()` and optionally `make_metadata_card_from_dict()`.
- Use `NotImplementedError` with a message variable for unimplemented methods:
  ```python
  def make_metadata_card_from_url(self, url: str) -> EducationResource:
      msg = "This method is not implemented yet."
      raise NotImplementedError(msg)
  ```
- Add an `if __name__ == "__main__":` block for single-file testing.
- **Mark the file executable** after creation so that `check-shebang-scripts-are-executable`
  (a pre-commit hook) does not fail:
  ```bash
  git add --chmod=+x server/plugins/<plugin_name>/plugin.py
  git add --chmod=+x server/plugins/<plugin_name>/<plugin_name>_models.py
  ```

#### 4. (Optional) Create `bulk_import.py` — batch import utilities

If the source provides a bulk data export (CSV, JSON dump, API pagination), or requires web
scraping, add a `bulk_import.py` to handle fetching and converting that data into
`EducationResource` objects.  Cache results locally so that repeated runs do not re-fetch
the site.  Mark the file executable the same way as other scripts:

```bash
git add --chmod=+x server/plugins/<plugin_name>/bulk_import.py
```

See `server/plugins/eric/bulk_import.py` for an API/JSON reference implementation,
`server/plugins/early_learning/bulk_import.py` for a web-scraping reference, and
`server/plugins/pressbooks/bulk_import.py` for an async/concurrent pagination example.

---

### HTTP requests: always chain `.raise_for_status()`

When making HTTP requests with `httpx`, chain `.raise_for_status()` directly onto
the `.get()` (or `.post()`, etc.) call instead of calling it on a separate line.
`httpx.Response.raise_for_status()` returns `self`, so the response object is still
available for further use:

```python
# Preferred — chain raise_for_status() on the same line
response = client.get(url, params=params, headers=HEADERS).raise_for_status()
data = response.json()

# Also valid for one-liners when only the text/json is needed
soup = BeautifulSoup(
    client.get(url, headers=HEADERS, follow_redirects=True).raise_for_status().text,
    "html.parser",
)

# Discouraged — two-line raise_for_status
response = client.get(url)   # ← do not do this
response.raise_for_status()  # ← do not do this
```

This applies to both synchronous (`httpx.Client`) and asynchronous
(`httpx.AsyncClient`) usage.

---

### Exception suppression: prefer `contextlib.suppress` over `try/except/continue`

When a `try` block in a loop only catches an exception to continue to the next
iteration (i.e., the `except` body is just `continue` or `pass`), use
`contextlib.suppress` instead.  This is required by ruff rule **SIM105**
(`suppressible-exception`):

```python
# Preferred — contextlib.suppress
from contextlib import suppress

for fmt, length in DATE_FORMATS:
    with suppress(ValueError):
        return datetime.strptime(date_str[:length], fmt)
return None

# Discouraged — bare except/continue (ruff SIM105 will flag this)
for fmt, length in DATE_FORMATS:
    try:
        return datetime.strptime(date_str[:length], fmt)
    except ValueError:
        continue
return None
```

---

### Async / concurrent page fetching

When a REST API exposes pagination headers (e.g., WordPress REST APIs return
`X-WP-TotalPages` and `X-WP-Total`), use `httpx.AsyncClient` with
`asyncio.gather()` to fetch all pages concurrently instead of looping
sequentially:

```python
import asyncio

import httpx


async def _fetch_page(client: httpx.AsyncClient, params: dict) -> list:
    return await client.get(API_URL, params=params).raise_for_status().json()


async def fetch_all(*, per_page: int = 100, **filters) -> list:
    base_params = {"per_page": per_page, **filters}
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        first = await client.get(API_URL, params={**base_params, "page": 1})
        first.raise_for_status()
        total_pages = int(first.headers.get("X-WP-TotalPages", "1"))
        first_items = first.json()
        if total_pages <= 1:
            return first_items
        remaining = await asyncio.gather(
            *[
                _fetch_page(client, {**base_params, "page": p})
                for p in range(2, total_pages + 1)
            ]
        )
        return first_items + [item for page in remaining for item in page]


# Call from synchronous code:
all_items = asyncio.run(fetch_all(search="python"))
```

See `server/plugins/pressbooks/bulk_import.py` for a full working example.

---

### Exception Groups for validation loops

This project targets **Python 3.13+**.  When validating a list of records
(e.g., after a bulk API fetch), use an `ExceptionGroup` to collect *all*
`ValidationError` exceptions and report them together rather than raising on
the first failure or silently discarding errors one at a time:

```python
from pydantic import ValidationError


def _parse_records(items: list) -> list[MyModel]:
    records: list[MyModel] = []
    errors: list[ValidationError] = []
    for item in items:
        try:
            records.append(MyModel.model_validate(item))
        except ValidationError as exc:
            errors.append(exc)
    if errors:
        try:
            raise ExceptionGroup(
                f"Skipping {len(errors)} malformed record(s)", errors
            )
        except* ValidationError as eg:
            for exc in eg.exceptions:
                logger.warning("Malformed record: %s", exc)
    return records
```

The `try / raise ExceptionGroup / except*` idiom logs every bad record in a
single structured report while still returning all valid records to the caller.

---

#### 5. Update the channel count in tests

`tests/test_ome_node.py` hard-codes the expected number of channels.  Increment it by 1
for each new plugin you add.  Search for `len(channels) ==` and update every occurrence.

#### 6. Verify the plugin is discovered

Run `get_ome_plugins.py` as an executable (it has a `#!/usr/bin/env -S uv run --script` shebang) to confirm the new plugin is detected:

```bash
./server/get_ome_plugins.py
```

The output should include your new plugin's class name, `mimetypes`, and `newsgroups`.

#### 7. Run pre-commit to validate your changes

**Always run `pre-commit run --all-files` after adding or modifying any files:**

```bash
pre-commit run --all-files
```

Fix any issues reported before committing.

---

### Web-scraping variant

Use this when the source site has **no public REST or JSON API** (e.g., Drupal, WordPress,
or static HTML sites).  The pattern uses `httpx` for HTTP fetches and `BeautifulSoup` for
HTML parsing.

#### Models (`<name>_models.py`)

Write the Pydantic model by hand from the fields you intend to scrape — there is no JSON
response to feed into `datamodel-codegen`.  Omit `from __future__ import annotations` if
any field has a `datetime` type:

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.13"
# dependencies = ["pydantic"]
# ///

from datetime import datetime

from pydantic import BaseModel, RootModel


class <PluginName>Item(BaseModel):
    title: str = ""
    url: str = ""
    description: str = ""
    authors: list[str] = []
    subjects: list[str] = []
    language: str = ""
    license: str = ""
    publisher: str = ""
    date: datetime | None = None


class <PluginName>Model(RootModel[list[<PluginName>Item]]):
    pass
```

#### `bulk_import.py` skeleton for scraping

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.13"
# dependencies = ["beautifulsoup4", "httpx", "pydantic"]
# ///

from __future__ import annotations

from datetime import datetime
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

from server.plugins.<plugin_name>.<plugin_name>_models import (
    <PluginName>Item,
    <PluginName>Model,
)

SEARCH_URL = "https://example.com/resources"
BASE_URL = "https://example.com"
MAX_RESULTS = 8
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; OME-Bot/1.0)"}


def _absolute_url(href: str) -> str:
    return href if href.startswith("http") else BASE_URL + href


def scrape_resource_page(client: httpx.Client, url: str) -> <PluginName>Item:
    soup = BeautifulSoup(
        client.get(url, headers=HEADERS, follow_redirects=True).raise_for_status().text,
        "html.parser",
    )
    title = (soup.select_one("h1") or soup.new_tag("span")).get_text(strip=True)
    # ... extract other fields using CSS selectors
    return <PluginName>Item(title=title, url=url)


def scrape_search_results(
    client: httpx.Client, url: str = SEARCH_URL, max_results: int = MAX_RESULTS
) -> list[str]:
    soup = BeautifulSoup(
        client.get(url, headers=HEADERS, follow_redirects=True).raise_for_status().text,
        "html.parser",
    )
    urls: list[str] = []
    for article in soup.select("article"):
        if len(urls) >= max_results:
            break
        link = article.select_one("a[href]")
        if link:
            urls.append(_absolute_url(str(link["href"])))
    return urls


def bulk_import(url: str = SEARCH_URL, max_results: int = MAX_RESULTS) -> list[<PluginName>Item]:
    cache = Path(__file__).resolve().parent / "<plugin_name>_resources.json"
    if cache.exists():
        return <PluginName>Model.model_validate_json(cache.read_text()).root
    items: list[<PluginName>Item] = []
    with httpx.Client(timeout=30) as client:
        for resource_url in scrape_search_results(client, url, max_results):
            items.append(scrape_resource_page(client, resource_url))
    cache.write_text(<PluginName>Model(root=items).model_dump_json(indent=2))
    return items


if __name__ == "__main__":
    for i, item in enumerate(bulk_import(), start=1):
        print(f"{i:>2}. {item.title!r}")
```

**Drupal-specific tips** (many OER sites run Drupal):

- Field selectors follow the pattern `div.field--name-field-<name> .field__item`.
- Title: `h1.page-title` or `h1`.
- Search result links: `article h3.node__title a` or `.views-field-title a`.
- Date: `time[datetime]` attribute value is the most reliable source.
- Always provide multiple fallback selectors — theme customisations vary between sites.

---

### Quick Reference: `EducationResource` Fields

Defined in `server/plugins/ome_plugin.py`:

| Field | Type | Description |
|-------|------|-------------|
| `title` | `str` | Resource title |
| `description` | `str` | Resource description |
| `authors` | `list[str]` | List of author names |
| `authoring_institution` | `str` | Publishing institution |
| `subject_tags` | `list[str]` | Subject/keyword tags |
| `creation_date` | `datetime \| None` | Original creation date |
| `last_modified_date` | `datetime \| None` | Last modification date |
| `source_url` | `str` | Permanent URL to the resource |
| `version_url` | `str` | URL to this specific version |
| `spdx_license_expression` | `str` | License (SPDX format, e.g. `CC-BY-4.0`) |

### Existing Plugins (for reference)

| Plugin | Directory | Notable Feature |
|--------|-----------|----------------|
| ERIC | `server/plugins/eric/` | Most advanced; bulk CSV/JSON import |
| Early Learning | `server/plugins/early_learning/` | Web scraping (no API); BeautifulSoup + httpx |
| OERCommons | `server/plugins/oercommons/` | Simple JSON transform |
| Open Library | `server/plugins/openlibrary/` | Linked metadata (two API calls) |
| Qubes | `server/plugins/qubes/` | XML-to-JSON conversion |
| WHG | `server/plugins/whg/` | World Historical Gazetteer data |
