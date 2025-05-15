#!/usr/bin/env -S uv run --script

# /// script
# requires-python = "==3.12"
# dependencies = [
#     "pydantic",
#     "pynntp",
# ]
# ///

"""
We have two NNTP servers Austin (the writer) and Boston (the city) to demonstrate how
OME nodes can publish and subscribe to metadata in the peer-to-peer network.  Once the
NNTP servers have started, get the newsgroups required by all plugins and create those
newsgroups on both NNTP servers.
"""

# import asyncio

import subprocess
import time

from nntp import NNTPClient

from server.get_ome_plugins import get_newsgroups_from_plugins


def create_newsgroups(newsgroups: dict[str, str], nntp_server_name: str) -> str:
    """
    Create newsgroups on the NNTP server using `ctlinnd newgroup newsgroup` command.
    Then append newsgroup descriptions to the end of the `db/newsgroups` file.
    The complexity is that we need to run these commands inside a Docker container.
    """
    server_name = f"open-metadata-exchange-internetnews-server-{nntp_server_name}-1"
    command = " && ".join(f"ctlinnd newgroup {name}" for name in newsgroups)
    command = f'docker exec -it {server_name} sh -c "{command}"'
    print(f"{command=}")

    completed_process = subprocess.run(  # noqa: S602
        command, capture_output=True, shell=True, check=True, text=True
    )
    print(f"{completed_process.stdout=}")
    ret_val = completed_process.stdout

    # Append newsgroup descriptions to the end of the `db/newsgroups` file.
    command = " && ".join(
        f"echo '{name:<23} {description.replace("'", '')}' >> db/newsgroups"
        for name, description in newsgroups.items()
    )
    command = f'docker exec -it {server_name} sh -c "{command}"'
    print(f"{command=}")

    completed_process = subprocess.run(  # noqa: S602
        command, capture_output=True, shell=True, check=True, text=True
    )
    print(f"{completed_process.stdout=}")
    return ret_val


def main() -> None:
    newsgroups = get_newsgroups_from_plugins()
    print(f"{newsgroups=}")
    time.sleep(5)  # Wait for the NNTP servers to start

    with (
        NNTPClient("localhost", 119) as src_nntp_client,
        NNTPClient("localhost", 1119) as dst_nntp_client,
    ):
        for nntp_client in (src_nntp_client, dst_nntp_client):
            create_newsgroups(newsgroups, nntp_client)
    print(f"{len(newsgroups)} newsgroups created.")


if __name__ == "__main__":
    main()
    print("When you want to keep the NNTP servers in sync, run: scripts/nntp_sync.py")
