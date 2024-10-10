# FastAPI server
## A backend for the FE2 user interface

### Using Docker

Docker build and run the FastAPI server in background mode and
follow the logs with:
```bash
docker build --tag=fastapi-server --no-cache --progress=plain . \
  && docker run --detach --publish=5001:5001 fastapi-server \
  && docker logs -f $(docker ps -lq)

open http://localhost:5001
open http://localhost:5001/docs
```
Options:
* Remove `--no-cache` to accelerate rebuilds.
* Remove `--progress=plain` to hide the build logs.
* Remove `--detach` to run FastAPI as a foreground job.
* Change `--publish <host_port>:<container_port>` to use a different host port.
* Remove the `docker logs` command to keep the terminal free of logging info.

To kill the background container, run:
```bash
docker kill $(docker ps -lq)
```

### Without Docker

For local development and testing:
```bash
pipenv shell
PYTHONPATH=. fastapi dev --host=0.0.0.0 --port=5001 server/main.py

open http://localhost:5001
open http://localhost:5001/docs
```
