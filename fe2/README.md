# FE2

This code runs in production on Node.js v18.19.0 using a different backend.
In the near term, we should make minimal code changes so that we do not
diverge too much from that production codebase.

The initial goal is to get this code up and running and communicating with
the FastAPI server that is currently in the `server/` directory. There
should probably be a Node.js server process that can handle 4xx and 5xx
errors. After we have communication running from FE2 to Server to INN2,
we can reevaluate where further code changes should be focused.

```bash
cd fe2
npm ci
npm run start
# Wait for `webpack x.y.z compiled successfully`
open http://localhost:4000/imls
```


## % `cd fe2 && npm run`

```
Lifecycle scripts included in imls-react@1.0.0, available via `npm run script`:

  start
    webpack serve --env port=4000
  start:dev:server
    npx json-server --watch db.json
  start:dev
    # todo: concurrently "npm run start:dev:server" "npm run start"
  docker:run
    docker run -d -p 4000:4000 --name imls-react imls-react
  docker:build
    docker build -t imls-react .
  dockerize
    npm run docker:build && npm run docker:run
  build
    webpack --env mode=production
  build:watch
    webpack --watch --env mode=development
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
