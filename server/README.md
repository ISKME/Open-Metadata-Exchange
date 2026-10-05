# OME FastAPI server

## A backend for the FE2 user interface

Transport: Network News Transfer Protocol (NNTP) server

Backend: FastAPI server for API and business logic.

Frontend: IMLS user interface in React.js (FE2).

### Using Docker

Docker build and run a local NNTP server and FastAPI server:

```bash
docker compose build --no-cache nntp-server fastapi-server
docker compose up nntp-server fastapi-server
open http://localhost:5001  # or `xdg-open http://localhost:5001` on Linux
open http://localhost:5001/docs
```

If you also want the frontend 'imls-react' service, use:

```bash
docker compose build --no-cache
docker compose up
open http://localhost:5001
open http://localhost:5001/docs
```

### Without Docker

For local development and testing (TODO: fix me):

```bash
uv run fastapi dev --host=0.0.0.0 --port=5001 server/main.py
open http://localhost:5001
open http://localhost:5001/docs
```
