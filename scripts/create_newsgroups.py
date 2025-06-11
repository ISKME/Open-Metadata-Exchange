#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

"""
We have two NNTP servers Austin and Boston (to demonstrate how OME nodes can publish
and subscribe to metadata in the peer-to-peer network.  Once the NNTP servers have
started, get the newsgroups required by all plugins and create those newsgroups on both
NNTP servers.
"""

import subprocess
import time

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
    # If the newsgroups already exist, could we be adding duplicates?
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

    for nntp_server_name in ("austin", "boston"):
        print(f"Creating {len(newsgroups)} newsgroups on {nntp_server_name=}")
        create_newsgroups(newsgroups, nntp_server_name)


if __name__ == "__main__":
    main()
    print("When you want to keep the NNTP servers in sync, run: scripts/nntp_sync.py")
