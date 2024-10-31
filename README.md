# OME Readme
Distributed / Decentralized Network for Open Metadata Exchange

[![ome_build](https://github.com/ISKME/Open-Metadata-Exchange/actions/workflows/build.yml/badge.svg)](https://github.com/ISKME/Open-Metadata-Exchange/actions/workflows/build.yml)
[![ome_docs](https://github.com/ISKME/Open-Metadata-Exchange/actions/workflows/sphinx.yml/badge.svg)](https://github.com/ISKME/Open-Metadata-Exchange/actions/workflows/sphinx.yml)

## High Level "what connects to what"

```mermaid
sequenceDiagram
	participant Browser
	participant FE2-on-NodeServer
	participant FastAPI-Server
	participant InterNetNews

	Browser->>FE2-on-NodeServer: GET localhost:4000/imls
	FE2-on-NodeServer->>Browser: index.html from React app
	Browser->>FE2-on-NodeServer: API calls (it's proxied in DEV mode)
	FE2-on-NodeServer->>FastAPI-Server: Forwarded API calls
	FastAPI-Server->>InterNetNews: Query as appropriate
        InterNetNews->>FastAPI-Server: Metadata response
	FastAPI-Server->>FE2-on-NodeServer: API Data response
	FE2-on-NodeServer->>Browser: API Data response
```

## Install the components:
### [InterNetNews](https://github.com/InterNetNews/inn) will be run in a Docker container:
Also:
* <https://www.isc.org/othersoftware/#INN>
* <https://www.eyrie.org/~eagle/software/inn/docs-2.7>
* <https://github.com/cclauss/apt-get-inn2-docker>

### [FastAPI](https://fastapi.tiangolo.com/)-Server will be run in a Docker container:
From the project root directory

### NodeServer (Node.js Vue app)
From the project root directory
```bash
cd fe
npm install
```

## Run the components
For local development and testing, start the INN2 server and FastAPI server with:
```bash
docker compose -f docker-compose.debug.yml up
```

### InterNetNews server:
For local development and testing, start the INN2 server with:
```bash
docker run --rm -t -p119:119 -p563:563 cclauss/inn
```

### FastAPI Python app:
For local development and testing:
```bash
pipenv shell
PYTHONPATH=. fastapi dev --host=0.0.0.0 --port=5001 server/main.py

open http://localhost:5001
open http://localhost:5001/docs
```

Or docker build and run the FastAPI server in background mode and
follow the logs with:
```bash
docker build --tag=fastapi-server --no-cache --progress=plain . \
  && docker run --detach --publish=5001:5001 fastapi-server \
  && docker logs -f $(docker ps -lq)

open http://localhost:5001
open http://localhost:5001/docs
```

### FE NodeServer
```bash
cd fe
npm run dev --host=0.0.0.0
```

### FE2 NodeServer
```bash
cd fe2
npm ci
npm run start
# Wait for `webpack x.y.z compiled successfully`
open http://localhost:4000/imls
```

## Additional bits
For those wanting to "integrate" with OERCommons (either from the
local dev environment, or - with some changes to the script - the
production environment). Install [tampermonkey](https://www.tampermonkey.net/)
if you're using Google Chrome, and then install the script that is in
`tools/monkeyscript/OERCommons.tampermonkey_script.js` so that you get
a button on OERCommons details page to export items from OERCommons
into the locally running OME. This allows you to see how you might
export - in a very proof-of-concept way - from your local library
software to the OME.
