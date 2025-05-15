#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pynntp",
#     "rich",
# ]
# ///

import os
from collections.abc import Iterator

import nntp
from rich.console import Console
from rich.table import Table

AUSTIN_PORT = 119
BOSTON_PORT = AUSTIN_PORT + 1000
CLIENT: nntp.NNTPClient | None = None
DEFAULT_NEWSGROUPS = (
    "control.cancel",
    "control.checkgroups",
    "control.newgroup",
    "control.rmgroup",
    "control",
    "junk",
    "local.general",
    "local.test",
)


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


def get_nntp_newsgroup_status(nntp_client: nntp.NNTPClient) -> Iterator[dict]:
    """
    Yield dicts that represent the status of an NNTP newsgroup.
    """
    for name, description in sorted(nntp_client.list_newsgroups()):
        if name in DEFAULT_NEWSGROUPS:
            continue
        total, first, last, group = nntp_client.group(name)
        assert name == group  # noqa: S101
        yield {
            "name": name,
            "description": description,
            "last_updated": "2023-10-01T00:00Z",
            "total_first_last": [total, first, last],
        }


def get_nntp_status(port: int = 119) -> str:
    """
    Return a dict to represent the status of the newsgroups of an NNTP server.
    """
    server_name = "Austin" if port == AUSTIN_PORT else "Boston"
    if nntp_client := get_nntp_client(port=port):
        return {
            "server_name": server_name,
            "newsgroups": get_nntp_newsgroup_status(nntp_client),
        }
    return {
        "server_name": f"{server_name} server not reachable.",
        "newsgroups": [],
    }


if __name__ == "__main__":
    from datetime import UTC, datetime

    print(datetime.now(UTC))
    """
    for port in (AUSTIN_PORT, BOSTON_PORT):
        if nntp_client := get_nntp_client(port=port):
            print(f"INN server @ {port=}:\n\t" + "\n\t".join(channels(nntp_client)))
            print(f"\t{'-' * 24}")
            for name, description in sorted(nntp_client.list_newsgroups()):
                print(f"\t{name=:<20}: {description=}")
    """

    # import datetime  # Modify above: requires-python = "==3.12"
    # import nntplib  # Removed from the Python standard library in 3.12

    # for port in (AUSTIN_PORT, BOSTON_PORT):
    #    if nntp_client := nntplib.NNTP("localhost", port=119):
    #        print(f"INN server @ {port=}:")
    #        for newsgroup in nntp_client.newgroups(datetime.date(1970, 1, 1))[1]:
    #            print(f"\t{newsgroup.group=}")

    #     #        print(f"\t{'-' * 24}")
    console = Console()
    # table = Table(title="Interactive Newsgroup Network (INN) Channels")
    # table.add_column("Austin (port: 119)", justify="left")
    # table.add_column("Boston (port: 1119)", justify="left")
    for port in (AUSTIN_PORT, BOSTON_PORT):
        status = get_nntp_status(port=port)
        table = Table(title=f"{status['server_name']} ({port=:,})")
        for title in ("newsgroup", "description", "last_updated", "total_first_last"):
            table.add_column(title, justify="left")
        for newsgroup in status["newsgroups"]:
            table.add_row(
                newsgroup["name"],
                newsgroup["description"],
                newsgroup["last_updated"],
                str(newsgroup["total_first_last"]),
            )
        console.print(table)
        print()
