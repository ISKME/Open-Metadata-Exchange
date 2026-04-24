---
title: Conventions
description: Frontmatter schema, tag taxonomy, link style for this vault
tags: [meta, conventions]
created: 2026-04-19
updated: 2026-04-19
---

# Conventions

## Frontmatter

Every page begins with a YAML block:

```yaml
---
title: <Human title — usually matches the filename>
description: <One sentence used by Obsidian's properties view and by agents>
tags: [<topic>, <role>, …]
aliases: [<alternate titles>]          # optional
related: ["[[Other Page]]", …]         # optional
status: draft | stable | deprecated    # optional
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

- `title` and `description` are required.
- `tags` use a flat or hierarchical form (`plugin`, `plugin/eric`).
- Dates are ISO‑8601, no time zone.

## Tag taxonomy

| Tag                    | Applied to                                   |
|------------------------|----------------------------------------------|
| `#overview`            | narrative framing pages                      |
| `#architecture`        | system or data‑level design                  |
| `#plugin`              | plugin system pages                          |
| `#plugin/<name>`       | per‑plugin pages                             |
| `#operations`          | running / deploying / monitoring             |
| `#developer`           | contributor‑facing guides                    |
| `#user`                | librarian / consumer / publisher guides      |
| `#adr`                 | architecture decision records                |
| `#api`                 | interface reference                          |
| `#reference`           | glossary, external links                     |
| `#meta`                | vault about / conventions                    |

## Links

- Internal links are **wikilinks**: `[[Page Name]]` or `[[Page Name|display text]]`.
- External links are regular Markdown: `[text](https://…)`.
- Refer to upstream tickets as `[iskme/Open-Metadata-Exchange#NNN]` so both
  GitHub and agents render them correctly.

## Structure

- Top‑level folders use `NN-Kebab-Case/` so they sort naturally.
- Page filenames use `Title Case With Spaces.md`. Obsidian handles the
  spaces transparently.
- `Home.md` is the entry point and the Map of Content (MOC).
- Each major section has at least one index/overview page.

## Diagrams

Use fenced `mermaid` blocks. Obsidian renders them natively; GitHub does
too. Prefer ASCII‑art only for ad‑hoc structure where mermaid is overkill.

## Callouts

Use Obsidian callouts for emphasis. They render as block‑quotes on GitHub.

```
> [!note] Title
> Body
```

Supported types used in this vault: `note`, `tip`, `warning`, `info`,
`example`, `question`.

## Keep it short

Each page should answer one question. Cross‑link related concepts instead
of nesting everything into one long file.
