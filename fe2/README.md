# FE2

This code runs in production on Node.js v18.19.0 using a different backend.
In the near term, we should make minimal code changes so that we do not
diverge too much from that production codebase.

The initial goal is to get this code up and running and communicating with
the FastAPI server that is currently in the `server/` directory.  There
should probably be a Node.js server process that can handle 4xx and 5xx
errors.  After we have communication running from FE2 to Server to INN2,
we can reevaluate where further code changes should be focused.

## % `cd fe2 && npm run`
```
Lifecycle scripts included in imls-react@1.0.0:
  start
    webpack serve --env port=4000

available via `npm run-script`:
  start:dev:server
    npx json-server --watch db.json
  build:prod
    webpack  --env mode=production
  build:dev
    webpack  --env mode=development
  lint:ts
    eslint "**/*.{ts,tsx}"
  lint:ts:fix
    eslint "**/*.{ts,tsx}" --fix
  lint:scss
    npx stylelint "**/*.scss"
  lint:scss:fix
    npx stylelint "**/*.scss" --fix
  unit
    jest --config ./config/jest/jest.config.ts
```
