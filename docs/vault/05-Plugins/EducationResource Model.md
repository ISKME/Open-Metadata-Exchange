---
title: EducationResource Model
description: The target schema every plugin produces
tags: [plugin, data]
created: 2026-04-19
updated: 2026-04-19
---

# `EducationResource` — plugin target schema

When you write `make_metadata_card_from_json()` (or `_from_dict()`), the
return type is an `EducationResource`. Every plugin maps its source fields
onto this shared shape.

## Schema

| Field                     | Type               | Default | Recommended source                                             |
|---------------------------|--------------------|---------|----------------------------------------------------------------|
| `title`                   | `str`              | `""`    | Source title / name                                            |
| `description`             | `str`              | `""`    | Source description / abstract                                  |
| `authors`                 | `list[str]`        | `[]`    | Author names. Don't include emails here.                       |
| `authoring_institution`   | `str`              | `""`    | Publisher / institution                                        |
| `subject_tags`            | `list[str]`        | `[]`    | Subject / keyword list                                         |
| `creation_date`           | `datetime \| None` | `None`  | Original creation date (parse with `dateparser`)               |
| `last_modified_date`      | `datetime \| None` | `None`  | Source's own `modified` / `updated` field                      |
| `source_url`              | `str`              | `""`    | Permanent URL. Will anchor future dedup — fill it in.          |
| `version_url`             | `str`              | `""`    | URL to *this* version, if the source versions its records      |
| `spdx_license_expression` | `str`              | `""`    | SPDX form (`CC-BY-4.0`, `CC0-1.0`, …), not a free‑text name    |

## Mapping guidance

- **Leave fields empty** when the source doesn't provide them. Don't
  fabricate.
- **Normalise dates** through `dateparser.parse(...)`. Sources lie about
  their date formats.
- **SPDX licences.** Map common free text ("Creative Commons
  Attribution 4.0" → `CC-BY-4.0`) using a shared helper if you add one.
  Never leave a non‑SPDX string in that field.
- **`source_url` matters.** It's the most likely anchor for future
  cross‑source dedup (see [[../02-Architecture/Deduplication Strategy]]).

## Example mapper

From ERIC's source JSON:

```python
def _make_metadata_card(self, item: EricItem) -> EducationResource:
    return EducationResource(
        title=item.title,
        description=item.description,
        authors=item.author,
        authoring_institution=item.publisher or "",
        subject_tags=item.subject,
        creation_date=item.publicationdateyear,
        last_modified_date=item.publicationdateyear,
        source_url=item.url or "",
    )
```

## Source

Defined at
[`server/plugins/ome_plugin.py`](../../../server/plugins/ome_plugin.py).
Note there is a second, richer definition at
`src/education_resource.py` that includes `usage: list[PedigreeRecord]`;
see [[../02-Architecture/Data Model]] for the live vs aspirational
distinction.

## Related

- [[Writing a Plugin]]
- [[../02-Architecture/Data Model]]
- [[../02-Architecture/Deduplication Strategy]]
