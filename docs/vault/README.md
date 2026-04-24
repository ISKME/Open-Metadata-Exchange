---
title: OME Documentation Vault
description: How to open and use this Obsidian vault
tags: [meta, vault]
created: 2026-04-19
updated: 2026-04-19
---

# OME Documentation Vault

This folder is an **Obsidian vault** containing the comprehensive developer and user
documentation for Open Metadata Exchange (OME).

You can read every page as plain Markdown on GitHub, but opening it in Obsidian
unlocks the graph view, backlinks, tag filtering, canvas diagrams, and full‑text
search across the entire vault.

## Open in Obsidian

1. **Download Obsidian** — <https://obsidian.md> (free, MIT‑licensed clients on
   macOS, Windows, Linux, iOS, Android).
2. In Obsidian choose **Open folder as vault** and pick this directory
   (`docs/vault/`).
3. Start from [[Home]]. Use `Cmd/Ctrl‑O` to jump to any page by title, and
   `Cmd/Ctrl‑Shift‑F` to full‑text search.

## Why a vault?

- **Graph view** shows how concepts, plugins, and ADRs relate at a glance.
- **Backlinks** make it trivial to see everything that references a given page.
- **Tags & properties** (YAML frontmatter) turn the vault into a structured
  knowledge base that both humans and AI agents can query.
- **Markdown files on disk** mean the vault diffs cleanly in Git and can be
  generated, linted, and automated like any other source artifact.

## Reading on GitHub

Wiki‑style links (`[[Page Name]]`) render as plain text on GitHub but still
resolve inside Obsidian. All pages are valid CommonMark, so every individual
file reads fine in any Markdown viewer.

## Layout

```
docs/vault/
├── Home.md                  ← start here
├── 00-Meta/                 vault conventions
├── 01-Overview/             what OME is, goals, non‑technical pitch
├── 02-Architecture/         system diagrams, data model, NNTP, plugins, dedup
├── 03-Getting-Started/      quickstart + local development
├── 04-Developer-Guide/      contributing, testing, tooling
├── 05-Plugins/              plugin system, writing a plugin, registry
├── 06-Operations/           running INN, deployment, sync
├── 07-API-Reference/        REST (Swagger) + NNTP interfaces
├── 08-User-Guide/           librarians, consumers, publishers
├── 09-Decisions/            ADRs, including deduplication strategy
└── 99-Reference/            glossary and external links
```

## Relationship to existing docs

The canonical narrative docs in the repository root (`README.md`,
`CONTRIBUTING.md`, `docs/overview.md`, per‑plugin READMEs) are **unchanged**.
This vault is an additional, structured view of the same knowledge plus
new content that was missing (architecture, operations, ADRs, user guide).

See [[00-Meta/About the Vault]] for the relationship in more detail and for
the proposal to make this the primary documentation surface.
