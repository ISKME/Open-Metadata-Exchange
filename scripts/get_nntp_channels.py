#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.9"
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
    return (CLIENT := nntp.NNTPClient(inn_server_name, port=port))


def channels(nntp_client: nntp.NNTPClient) -> Iterator[str]:
    for name, description in set(nntp_client.list_newsgroups()):
        yield f"{name=:<20}: {description=}"


if __name__ == "__main__":
    austin_nntp = get_nntp_client(port=119)
    print("NNTP Server @ port 119:\n\t" + "\n\t".join(channels(austin_nntp)))

    boston_nntp = get_nntp_client(port=1119)
    print("NNTP Server @ port 1119\n\t" + "\n\t".join(channels(boston_nntp)))
