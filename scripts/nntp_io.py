#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "pynntp",
# ]
# ///

import email
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
    body = pynntp_client.body()
    print(f"{body = }")

    # Parse MIME message to extract JSON content
    mime_string: str = body.decode("utf-8") if hasattr(body, "decode") else body

    # Parse the MIME message
    msg = email.message_from_string(mime_string)
    print(f"{msg = }")
    print(f"{msg.is_multipart() = }")

    # If it's multipart, get the first part with JSON content
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                json_content = part.get_payload()
                return json.loads(json_content)
    else:
        # If not multipart, get the payload directly
        json_content = msg.get_payload()
        print(f"{json_content = }")
        return json.loads(json_content)

    # Fallback: try to parse the body directly as JSON
    return json.loads(body)


if __name__ == "__main__":
    import os
    import sys

    newsgroup = "local.test" if os.getenv("CI") else "ome.oer"
    if sys.argv[1:]:
        newsgroup = sys.argv[1]
    print(f"{__file__}: {newsgroup=}")
    payload = {"key": "value"}
    print(f"{nntp_write(payload, newsgroup) = }")
    try:
        print(f"{nntp_read() = }")
    except NNTPTemporaryError as e:
        print(f"{e!r} on nntp_read({newsgroup=})")
    pynntp_client.quit()
