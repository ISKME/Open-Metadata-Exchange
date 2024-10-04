# Build and run the server in background mode and follow the logs.
# https://docs.astral.sh/uv/guides/integration/docker/
# https://docs.astral.sh/uv/guides/integration/fastapi/

# docker build --tag=fastapi-server --no-cache --progress=plain . \
# && docker run --detach --publish=5001:5001 fastapi-server \
# && docker logs -f $(docker ps -lq)

# To kill the background container, run `docker kill $(docker ps -lq)`

# Use Asteal's uv Debian Bookworm Slim Python 3.12 base image
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

RUN uv venv && uv pip install "fastapi[standard]" pydantic pynntp && mkdir -p /app/server

# Create a directory for the FastAPI app
WORKDIR /app

# Copy the FastAPI app code to the container
COPY ./server /app/server
COPY ./static /app/static

# Expose port 5001
EXPOSE 5001

# Command to run the FastAPI server, binding it to port 5001
CMD ["uv", "run", "fastapi", "dev", "--host=0.0.0.0", "--port=5001", "server/main.py"]
