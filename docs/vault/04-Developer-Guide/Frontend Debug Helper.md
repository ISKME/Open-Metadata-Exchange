---
title: Frontend Debug Helper
description: The shared/debug helper that replaces console.log in FE2
tags: [developer, frontend]
aliases: [debug helper, no-console]
created: 2026-04-19
updated: 2026-04-19
---

# Frontend Debug Helper

Tracks [iskme/Open-Metadata-Exchange#291](https://github.com/ISKME/Open-Metadata-Exchange/issues/291);
addressed in PR
[iskme/Open-Metadata-Exchange#292](https://github.com/ISKME/Open-Metadata-Exchange/pull/292).

## Why

Ad‑hoc `console.log` calls clutter production consoles and leak PII. The
codebase enforces `no-console` in ESLint with an allow list of `warn` /
`error` and routes development‑time diagnostics through a single helper
that no‑ops in production.

## API

[`frontend/src/shared/debug.ts`](../../../frontend/src/shared/debug.ts):

```ts
export const debug = (...args: unknown[]): void => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
```

## Usage

```ts
import { debug } from "shared/debug";

debug("card loaded", card);
debug("fetch failed", { url, status });
```

The `shared/debug` import path is wired up in `tsconfig.json`'s
`paths: { "*": ["./src/*"] }`, so no relative `../../..` chains.

## When to reach for something else

| Case                                | Use                                    |
|-------------------------------------|----------------------------------------|
| User‑visible error                  | `console.error(...)` (allowed)         |
| Warning that should appear in prod  | `console.warn(...)` (allowed)          |
| Transient dev diagnostic            | `debug(...)`                           |
| Persistent trace / telemetry        | New helper (not `debug`)               |

## Testing

Unit tests at `frontend/src/shared/__tests__/debug.test.ts` cover:

- no‑op when `NODE_ENV === "production"`,
- forwarding when not production,
- variadic argument pass‑through.

## Related

- [[Contributing]]
- [[../03-Getting-Started/Running the Frontend]]
