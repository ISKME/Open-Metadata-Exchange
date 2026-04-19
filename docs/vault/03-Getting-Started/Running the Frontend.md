---
title: Running the Frontend
description: Native dev loop for the FE2 React app
tags: [getting-started, developer, frontend]
created: 2026-04-19
updated: 2026-04-19
---

# Running the Frontend

The current frontend lives in `fe2/` (React + TypeScript + webpack). The
older `frontend/` tree is being superseded.

## Prerequisites

- Node.js (check `.nvmrc` if present, otherwise the active LTS is a safe
  default).
- A FastAPI backend reachable at `http://localhost:5001` (see
  [[Local Development]]).

## Run

```bash
cd fe2
npm ci
npm run start
# wait for: "webpack x.y.z compiled successfully"
open http://localhost:4000/imls
```

`/api/*` calls are proxied to the FastAPI backend by webpack‑dev‑server.
See `fe2/webpack.config.js` for the proxy rule if you need to redirect
it (e.g. when pointing FE2 at a non‑default port).

## Tests

```bash
cd fe2
npm test                 # jest
npm run lint             # eslint
```

## Debug helper

`console.log` is not allowed in this codebase — ESLint enforces
`no-console` with an allow list of `warn` / `error`. Use the
environment‑gated helper instead:

```ts
import { debug } from "shared/debug";
debug("card loaded", card);
```

`debug` is a no‑op when `NODE_ENV === "production"`. See
[[../04-Developer-Guide/Frontend Debug Helper|the debug helper]].

## Related

- [[Quickstart]]
- [[Local Development]]
- [[../04-Developer-Guide/Contributing]]
