---
title: Writing a Plugin
description: Step-by-step recipe for adding a new OER source to OME
tags: [plugin, developer, howto]
aliases: [New Plugin, Plugin Guide]
created: 2026-04-19
updated: 2026-04-19
---

# Writing a Plugin

> [!info] Canonical source
> The full author's guide lives at
> [`.github/skills/plugin.md`](../../../.github/skills/plugin.md). That
> file is the source agents and reviewers use — keep it authoritative.
> This page is a vault‑friendly summary.

## Recipe

1. **Create the directory**
   ```bash
   mkdir server/plugins/<name>
   touch server/plugins/<name>/__init__.py
   ```
2. **Decide the access strategy**
   - JSON / REST API → `httpx` + `datamodel-codegen`
   - No API (HTML, Drupal, WordPress) → `httpx` + `BeautifulSoup`
3. **Generate source models** from a sample response:
   ```bash
   uv tool run --from=datamodel-code-generator datamodel-codegen \
       --input sample.json --input-file-type json \
       --output server/plugins/<name>/<name>_models.py
   ```
4. **Write `plugin.py`** — subclass `OMEPlugin`, set `mimetypes` and
   `newsgroups` (use `MappingProxyType`), implement
   `make_metadata_card_from_json()` / `make_metadata_card_from_dict()`.
5. **(Optional) Write `bulk_import.py`** — one‑shot importer for the
   source's full catalogue. Cache results locally under
   `<name>_resources.json`.
6. **Mark scripts executable** so the shebang hook passes:
   ```bash
   git add --chmod=+x server/plugins/<name>/plugin.py
   git add --chmod=+x server/plugins/<name>/<name>_models.py
   ```
7. **Post each item as an NNTP article** using
   `server/nntp_article.py` — see
   [[../02-Architecture/NNTP Backbone|article shape]].
8. **Update the channel count** in `tests/test_ome_node.py`
   (`len(channels) ==` assertions).
9. **Verify discovery**:
   ```bash
   ./server/get_ome_plugins.py
   ```
10. **Run pre‑commit**:
    ```bash
    pre-commit run --all-files
    ```

## Patterns to reuse

- Pagination via `httpx.AsyncClient` + `asyncio.gather()` — see
  `server/plugins/pressbooks/bulk_import.py`.
- `.raise_for_status()` **chained** on the same line as `.get()` — not a
  separate statement.
- `contextlib.suppress(ValueError)` over `try/except/continue` (Ruff
  `SIM105`).
- `ExceptionGroup` to report all validation failures from a batch
  instead of failing on the first.

## Reference plugin

`server/plugins/eric/` is the most advanced and should be read first
when building a new one.

## Related

- [[Plugin System Overview]]
- [[EducationResource Model]]
- [[Plugin Registry]]
- [[../04-Developer-Guide/Contributing]]
- [[../02-Architecture/NNTP Backbone]]
