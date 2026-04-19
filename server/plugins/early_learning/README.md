# Early Learning plugin

Imports metadata from the **Early Learning Resource Network** —
<https://www.earlylearningresourcenetwork.org>.

The Early Learning Resource Network aggregates openly-licensed
materials for birth-to-eight-year-old learners, curated for early
childhood educators.

## Contract surface

| Attribute | Value |
|---|---|
| Newsgroup | `ome.early_learning` |
| Class | `server.plugins.early_learning.plugin.EarlyLearningPlugin` |

## Supported inputs

See `plugin.py` for the currently implemented `make_metadata_card_*`
methods.

## Data source

The Early Learning Resource Network exposes resource metadata on its
public site. Consult `plugin.py` for the concrete fetch/parse path.

## Schema notes

Resources carry age range, subject area, format (lesson plan,
activity, reading, video), and license. The plugin maps these into
the `EducationResource` fields, using `subject_tags` for both
subject-area and age-range metadata.

## Quickstart

```bash
export CMS_PLUGIN=server.plugins.early_learning.plugin.EarlyLearningPlugin
uv run uvicorn server.main:app --reload --port 5001
```

## Files

```
server/plugins/early_learning/
└── plugin.py
```
