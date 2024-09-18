#!/usr/bin/env python3

import json
import nntplib  # Removed from the Standard Library in Python 3.13.

# import pathlib
import uuid

FMT = """\
From: GitHub Actions <actions@github.com>
Newsgroups: {}
Subject: inews test
Message-ID: <test.inews.{}@inn2.packages.debian.org>

{}
"""


def nntp_write(payload: dict, newsgroup: str = "local.test") -> int:
    """
    Write a payload dict as json to a InterNet News newsgroup.
    """
    msg = FMT.format(newsgroup, uuid.uuid4().hex, json.dumps(payload, indent=2))
    # print(f"{msg = }")
    with nntplib.NNTP("localhost", readermode=True) as nntp_server:
        _response = nntp_server.post(msg.encode("utf-8"))
        print(f"{_response = }")
        print(f"{nntp_server.stat()}")
        return nntp_server.stat()[2]
        # Verify that the article is there.
        _resp, _count, _first, last, _name = nntp_server.group(newsgroup)
        return last


def nntp_read(article_id: int, newsgroup: str = "local.test") -> dict:
    """
    Read an article from a InterNet News newsgroup and return it as a dict.
    """
    with nntplib.NNTP("localhost", readermode=True) as nntp_server:
        _resp, _count, _first, _last, _name = nntp_server.group(newsgroup)
        _stat = nntp_server.stat(article_id)
        _article = nntp_server.article(article_id)
        return json.loads(_article[1].lines[0].decode("utf-8"))


if __name__ == "__main__":
    payload = {"key": "value"}
    article_id = nntp_write(payload)
    print(f"{article_id = }")
    print(nntp_read(article_id))
