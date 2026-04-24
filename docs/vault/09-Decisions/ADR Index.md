---
title: ADR Index
description: Architecture Decision Records for OME
tags: [decisions, adr]
aliases: [ADRs, Decisions]
created: 2026-04-19
updated: 2026-04-19
---

# ADR Index

Architecture Decision Records (ADRs) capture the *why* behind OME's
major architectural choices. Each is short, dated, and frozen — once
accepted, an ADR is not edited; it is superseded by a new ADR if the
decision changes.

## Status vocabulary

- **Proposed** — written down but not yet adopted
- **Accepted** — in effect
- **Superseded by ADR‑XXXX** — historical, replaced by a later decision
- **Deprecated** — no longer in effect, nothing replaces it

## ADRs

| #     | Title                                                        | Status    |
|-------|--------------------------------------------------------------|-----------|
| 0001  | [[ADR-0001 NNTP as Backbone]]                                | Accepted  |
| 0002  | [[ADR-0002 Plugin Architecture]]                             | Accepted  |
| 0003  | [[ADR-0003 Deduplication Approach]]                          | Proposed  |

## When to write a new ADR

Write one when the team makes a choice that:

- has more than one reasonable answer,
- will be hard or expensive to reverse,
- will confuse newcomers if they don't know the reasoning.

Do *not* write an ADR for small, easily‑reversible choices (naming a
variable, picking a test framework for a throwaway script). Those
belong in code comments or PR descriptions.

## Template

```markdown
---
title: ADR-XXXX Short Title
description: One-line summary of the decision
tags: [decisions, adr]
status: proposed | accepted | superseded | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# ADR-XXXX Short Title

## Context
What is the problem? What forces are at play?

## Decision
What did we choose?

## Consequences
What follows from this choice — good, bad, and neutral?

## Alternatives considered
What did we reject, and why?
```
