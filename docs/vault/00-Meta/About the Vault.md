---
title: About the Vault
description: Purpose of this vault, relationship to existing docs, and proposal
tags: [meta, proposal]
created: 2026-04-19
updated: 2026-04-19
---

# About the Vault

## Why it exists

The existing documentation is a handful of narrative READMEs scattered across
the repository (`README.md`, `CONTRIBUTING.md`, `docs/overview.md`, plugin
READMEs). Individually they are fine; together they are hard to navigate and
have visible gaps:

- No architecture doc beyond the mermaid diagram in `README.md`.
- No operations / deployment guide beyond a plugin‑specific runbook.
- No end‑user‑facing material (librarians, resource authors, consumers).
- No Architecture Decision Records (ADRs).
- No canonical place to answer design questions such as [deduplication
  strategy](https://github.com/ISKME/Open-Metadata-Exchange/issues/85).

This vault collects the existing material, cross‑links it, and adds the
missing pieces in a format optimised for both humans (graph view, backlinks,
full‑text search) and AI agents (YAML frontmatter, structured tags, wiki
links resolvable by filename).

## Proposal

**Make this the primary documentation surface for OME.**

- Keep the top‑level `README.md` short — quickstart and a pointer to the
  vault at `docs/vault/`.
- Move narrative docs into the vault and cross‑link them there.
- Continue to generate an API reference with Sphinx + `sphinx‑autoapi` from
  docstrings; the vault links out to that site.
- Ship the vault as a folder so any contributor can open it in
  [Obsidian](https://obsidian.md) without installing plugins. Obsidian is
  free and cross‑platform.

### Why Obsidian specifically

- **File‑based.** Every page is a plain Markdown file on disk. Git, `grep`,
  `ripgrep`, and any text editor still work. Nothing is locked inside a
  database.
- **Local‑first.** No server, no account, no lock‑in. The vault works
  offline and diffs cleanly in pull requests.
- **Good for agents.** Wikilinks resolve by filename, YAML frontmatter is a
  queryable index, and tags form a taxonomy. An AI tool walking this tree
  gets structured context with very little scaffolding.
- **Good for humans.** Graph, backlinks, tag pane, canvas, and quick
  switcher make a 50‑file knowledge base navigable in a way that 50 files
  in nested folders are not.

If the maintainers prefer not to make Obsidian central, the vault still
works as plain Markdown on GitHub — wikilinks render as text instead of
links but every page is self‑contained.

## Relationship to existing docs

Nothing in `README.md`, `CONTRIBUTING.md`, `docs/`, or the per‑plugin
`README.md` files has been changed by this vault. The vault is additive
and lives entirely under `docs/vault/`.

Where the vault restates existing content it does so to keep the vault
self‑contained for agents and offline readers. Where the canonical source
is outside the vault (for example the plugin agent skill in
`.github/skills/plugin.md`), the vault links to it and summarises, rather
than duplicating line‑for‑line.

## Related

- [[Conventions]] — page layout, tags, frontmatter schema
- [[../Home|Home]] — Map of Content
