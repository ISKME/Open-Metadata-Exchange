# Open Metadata Exchange (OME)
Distributed / Decentralized Network for Open Metadata Exchange

[![ome_build](https://github.com/ISKME/Open-Metadata-Exchange/actions/workflows/build.yml/badge.svg)](https://github.com/ISKME/Open-Metadata-Exchange/actions/workflows/build.yml)

# High Level "what connects to what"

```{mermaid}
sequenceDiagram
	participant Browser
	participant NodeServer
	participant FastAPI-Server
	participant INN2

	Browser->>NodeServer: GET localhost:3000/
	NodeServer->>Browser: index.html with Vue.js App
	Browser->>NodeServer: API Calls (it's proxied in DEV mode)
	NodeServer->>FastAPI-Server: Forwarded API Calls
	FastAPI-Server->>INN2: Query as appropriate
	FastAPI-Server->>NodeServer: API Data response
	NodeServer->>Browser: API Data response
```

## To Install the components (will dockerize all of this in the near future):
### [INN2](https://github.com/InterNetNews/inn): Refer to [this](https://defuse.ca/inn-private-newsgroup-server-setup.htm) for installing INN2
Also:
* https://www.eyrie.org/~eagle/software/inn/docs-2.7
### [FastAPI](https://fastapi.tiangolo.com/)-Server
	From the project root directory
	```
	pipenv install
	pipenv sync
	```
### NodeServer (Node.js Vue app)
	From the project root directory
	```
	cd fe
	npm install
	```

## To run the components
### INN2: refer to the [INN2 documentation](https://www.isc.org/othersoftware/#INN)
### FastAPI Python app:
	```
	pipenv shell
	fastapi dev --port=5000 server/main.py
	```
### NodeServer
	```
	cd fe
	npm run dev --host=0.0.0.0
	```

# Additional bits
For those wanting to "integrate" with OERCommons (either from the
local dev environment, or - with some changes to the script - the
production environment), install [tampermonkey](https://www.tampermonkey.net/)
if you're using Google Chrome and then install the script that is in
`tools/monkeyscript/OERCommons.tampermonkey_script.js` so that you get
a button on OERCommons details page to export items from OERCommons
into the locally running OME. This allows you to see how you might
export - in a very proof-of-concept way - from your local library
software to the OME.
