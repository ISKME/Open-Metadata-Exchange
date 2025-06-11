#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pynntp",
# ]
# ///

import os
from collections.abc import Iterator

import nntp

AUSTIN_PORT = 119
BOSTON_PORT = AUSTIN_PORT + 1000
CLIENT: nntp.NNTPClient | None = None


def get_nntp_client(port: int = 119) -> nntp.NNTPClient:
    global CLIENT
    if CLIENT:
        return CLIENT

    # Environment variable INN_SERVER_NAME is defined in the docker-compose.yml file.
    inn_server_name = os.getenv("INN_SERVER_NAME", "localhost")
    if port == BOSTON_PORT:  # Special case for localhost accessing Boston container.
        inn_server_name = "localhost"
    try:
        return (CLIENT := nntp.NNTPClient(inn_server_name, port=port))
    except ConnectionRefusedError:
        print(f"INN server {inn_server_name}:{port} is not reachable.", flush=True)


def channels(nntp_client: nntp.NNTPClient) -> Iterator[str]:
    for name, description in sorted(nntp_client.list_newsgroups()):
        yield f"{name=:<20}: {description=}"


if __name__ == "__main__":
    for port in (AUSTIN_PORT, BOSTON_PORT):
        if nntp_client := get_nntp_client(port=port):
            print(f"INN server @ {port=}:\n\t" + "\n\t".join(channels(nntp_client)))
            print(f"\t{'-' * 24}")
            for name, description in sorted(nntp_client.list_newsgroups()):
                print(f"\t{name=:<20}: {description=}")
