#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "pynntp",
# ]
# ///

import json

from nntp import NNTPClient, NNTPTemporaryError

pynntp_client: NNTPClient = NNTPClient("localhost", port=119)


def nntp_pick_newsgroup(newsgroup: str = "local.test") -> tuple[str, ...]:
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
        "Newsgroups": newsgroup,
    }
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
    import os
    import sys

    newsgroup = "local.test" if os.getenv("CI") else "oer.public"
    if sys.argv[1:]:
        newsgroup = sys.argv[1]
    print(f"{__file__}: {newsgroup=}")
    payload = {"key": "value"}
    print(f"{nntp_write(payload, newsgroup)}")
    try:
        print(f"{nntp_read()}")
    except NNTPTemporaryError as e:
        print(f"{e!r} on nntp_read({newsgroup=})")
    pynntp_client.quit()
