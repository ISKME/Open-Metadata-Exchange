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
    ├── <name>_models.py   ← Required: Pydantic models for source data
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

#### 2. Create `<name>_models.py` — Pydantic models for source data

Generate models from a sample JSON response using `datamodel-codegen`:

```bash
uv tool run --from=datamodel-code-generator datamodel-codegen \
    --input <sample_response.json> \
    --input-file-type json \
    --output server/plugins/<plugin_name>/<plugin_name>_models.py
```

The generated file will contain Pydantic `BaseModel` classes that validate and parse the
source API's JSON. Add the standard script header and review the generated types.

Example structure (`server/plugins/eric/eric_models.py`):

```python
#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = ["pydantic"]
# ///

from __future__ import annotations
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
        return EducationResource(
            title=item.title,
            description=item.description,
            authors=item.authors,
            authoring_institution=item.institution or "",
            subject_tags=item.subjects,
            creation_date=item.created_date,
            last_modified_date=item.modified_date,
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

#### 4. (Optional) Create `bulk_import.py` — batch import utilities

If the source provides a bulk data export (CSV, JSON dump, API pagination), add a
`bulk_import.py` to handle fetching and converting that data into INN articles.

See `server/plugins/eric/bulk_import.py` for a reference implementation.

#### 5. Verify the plugin is discovered

Run `get_ome_plugins.py` to confirm the new plugin is detected:

```bash
python server/get_ome_plugins.py
```

The output should include your new plugin's class name, `mimetypes`, and `newsgroups`.

#### 6. Run pre-commit to validate your changes

**Always run `pre-commit run --all-files` after adding or modifying any files:**

```bash
pre-commit run --all-files
```

Fix any issues reported before committing.

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
| OERCommons | `server/plugins/oercommons/` | Simple JSON transform |
| Open Library | `server/plugins/openlibrary/` | Linked metadata (two API calls) |
| Qubes | `server/plugins/qubes/` | XML-to-JSON conversion |
| WHG | `server/plugins/whg/` | World Historical Gazetteer data |
