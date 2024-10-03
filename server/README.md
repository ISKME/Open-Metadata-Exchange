# FastAPI server: A backend for the FE2 user interface

Build and run the FastAPI server in background mode and follow the logs.
```bash
docker build --tag=fastapi-server --no-cache --progress=plain . \
  && docker run --detach --publish=5001:5001 fastapi-server \
  && docker logs -f $(docker ps -lq)
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
