#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.14"
# dependencies = [
#     "pynntp",
# ]
# ///

"""
Load QUBES records from qubes_records.json into the default NNTP server.

qubes_records.json must exist in the same directory as this script.
"""

import json
from pathlib import Path

from nntp import NNTPClient, NNTPTemporaryError


def nntp_pick_newsgroup(newsgroup: str = "ome.qubes") -> tuple[str, ...]:
    """Pick a newsgroup to be the current default.

    Args:
        newsgroup: name of an nntp newsgroup

    Returns:
        tuple(total, first, last, group) -- See pynntp docs.
    """
    return tuple(pynntp_client.group(newsgroup))


def nntp_write(payload: dict, newsgroup: str = "") -> bool:
    """Write a payload dict as json to a InterNet News newsgroup.

    Args:
        payload: Description of payload
        newsgroup: Description of newsgroup

    Returns:
        test.inews.a253222105b64597b9afd10e4f4c6740@inn2.packages.debian.org
    """
    if newsgroup:
        _total_first_last_group = nntp_pick_newsgroup(newsgroup)
    headers = {
        "Subject": f"Test post to {newsgroup}",
        "From": "GitHub Actions <actions@github.com>",
        "Newsgroups": newsgroup or "ome.qubes",
    }
    # for key in tuple(payload):
    #    if key != "id":
    #        payload.pop(key)
    # body=json.dumps(payload)
    # print(f"{body = }")
    # exit(1)
    return pynntp_client.post(headers=headers, body=json.dumps(payload, indent=2))


def nntp_read(newsgroup: str = "") -> dict:
    """
    Read an article from a InterNet News newsgroup and return it as a dict.

    Args:
        article_id: Description of article_id
        newsgroup: Description of newsgroup

    Returns:
        Description of return value
    """
    if newsgroup:
        _total_first_last_group = nntp_pick_newsgroup(newsgroup)
    _article_number, _headers, body = pynntp_client.article()
    print(f"{body = }")
    return json.loads(body)


if __name__ == "__main__":
    if not (json_filepath := Path(__file__).parent / "qubes_records.json").exists():
        raise FileNotFoundError

    with json_filepath.open() as in_file:
        records = json.load(in_file)

    print(f"Loaded {len(records)} records from {json_filepath.name}")

    try:
        with NNTPClient("localhost", port=119) as pynntp_client:
            _total_first_last_group = nntp_pick_newsgroup("ome.qubes")
            for record in records:
                try:
                    nntp_write(record)
                except NNTPTemporaryError as e:
                    print(f"Error posting record: {e}")
                    continue
                print(f"Posted record: {record['identifier']}")
    except ConnectionRefusedError as e:
        msg = "Is the Docker-based NNTP server running?"
        raise ConnectionRefusedError(msg) from e

    print(f"{len(records)} records posted successfully.")
