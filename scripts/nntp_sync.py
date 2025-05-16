#!/usr/bin/env -S uv run --script

# /// script
# requires-python = "==3.12"
# dependencies = [
#     "pydantic",
#     "pynntp",
#     "rich",
# ]
# ///

"""
We have two NNTP servers Austin (the writer) and Boston (the city) to demonstrate how
OME nodes can publish and subscribe to metadata in the peer-to-peer network.

Run `nntp_sync()` every five seconds to sync the articles between the two servers.
After each sync, print a table of each server's newsgroups and the number of articles.
NOTE: `nntp_sync()` is temporary workaround for greenbender/inn-docker#26.
"""

# import asyncio

import time
from collections.abc import Iterator
from datetime import UTC, datetime

from nntp import NNTPClient
from rich.console import Console
from rich.table import Table

from server.get_ome_plugins import get_newsgroups_from_plugins

rich_console = Console()


def get_group_headers(newsgroup: str, nntp_client: NNTPClient) -> dict:
    count, first, last, name = nntp_client.group(newsgroup)
    return {
        header["Message-ID"]: (article_number, header)
        for article_number, header in nntp_client.xover((first, last))
    }


def sync_articles(
    article_numbers: list[int], src_client: NNTPClient, dst_client: NNTPClient
) -> None:
    for article_number in sorted(article_numbers):
        try:
            article_nbr, headers, body = src_client.article(article_number)
            assert article_number == article_nbr  # noqa: S101
            print(f"{article_number=}, {headers=}")
            for key in ("Injection-Info", "Path", "Xref"):
                headers.pop(key)
            # Post to destination server.  .post() can return True or an error string!!
            assert (post_response := dst_client.post(headers, body)) is True, (  # noqa: S101
                post_response
            )
            print(f"Copied article {article_number} to destination")
        except ImportError as e:
            print(f"Error copying article {article_number}: {e}")


def nntp_sync(
    src_client: NNTPClient, dst_client: NNTPClient, newsgroups: dict[str, str]
) -> None:
    for newsgroup in newsgroups:
        # print(f"Syncing newsgroup: {newsgroup}")

        # Select the group on both servers
        # src_info = src_client.group(group)
        # dst_info = dst_client.group(group)

        # Get list of articles (we'll use article numbers)
        # src_range = (src_info['first'], src_info['last'])
        # dst_range = (dst_info['first'], dst_info['last'])

        # Get sets of available article numbers
        src_articles = get_group_headers(newsgroup, src_client)
        # print(f"{src_articles=}")
        dst_articles = get_group_headers(newsgroup, dst_client)
        # print(f"{dst_articles=}")

        if src_to_dst_articles := set(src_articles) - set(dst_articles):
            # print(f"{len(src_to_dst_articles)=}: {src_to_dst_articles=}")
            article_numbers = sorted(
                article_number
                for message_id, (article_number, header) in src_articles.items()
                if message_id in src_to_dst_articles
            )
            # print(f"{article_numbers=}")
            print(f"Syncing {len(article_numbers)} articles from {newsgroup}")
            sync_articles(article_numbers, src_client, dst_client)


def junk() -> None:
    """
    dst_to_src_articles = set(dst_articles) - set(src_articles)
    for article_number in sorted(dst_to_src_articles.values()):
        sync_articles(article_number, dst_client, src_client)
    print(f"{set(src_articles) - set(dst_articles)=}")
    print(f"{dst_articles.keys() - src_articles.keys()=}")
    # List articles in destination
    resp, count, first, last, name = dst_client.group(group)
    if count > 0:
        resp, overview = dst_client.xover(first, last)
        for entry in overview:
            dst_articles.add(int(entry['number']))
    # Determine missing articles
    missing_articles = src_articles - dst_articles
    print(f"{group}: {missing_articles=} = {src_articles} - {dst_articles}")
    print(f"Found {len(missing_articles)} missing articles in {group}")
    exit(0)
    # Copy missing articles
    for art_num in sorted(missing_articles):
        try:
            resp, info = src_client.article(art_num)
            headers = info['headers']
            body = info['body']
            # Reconstruct full article
            full_article = (
                "\r\n".join(headers) + "\r\n\r\n" + "\r\n".join(body) + "\r\n"
            )
            # Post to destination
            dst_client.post(full_article)
            print(f"Copied article {art_num} to destination")
        except Exception as e:
            print(f"Error copying article {art_num}: {e}")
    """


def get_nntp_newsgroup_status(
    nntp_client: NNTPClient, newsgroups: dict[str, str]
) -> Iterator[dict]:
    """
    Yield dicts that represent the status of an NNTP newsgroup.
    """
    for name, description in newsgroups.items():
        total, first, last, group = nntp_client.group(name)
        assert name == group  # noqa: S101
        yield {
            "name": name,
            "description": description,
            "last_updated": "2023-10-01T00:00Z",
            "total_first_last": [total, first, last],
        }


def nntp_status(
    src_client: NNTPClient, dst_client: NNTPClient, newsgroups: dict[str, str]
) -> None:
    # table = Table(title="Interactive Newsgroup Network (INN) Channels")
    # table.add_column("Austin (port: 119)", justify="left")
    # table.add_column("Boston (port: 1119)", justify="left")
    for i, nntp_client in enumerate((src_client, dst_client)):
        table = Table(title="Boston (port=1119)" if i else "Austin (port=119)")
        for title in ("newsgroup", "description", "last_updated", "total_first_last"):
            table.add_column(title, justify="left")
        for newsgroup in get_nntp_newsgroup_status(nntp_client, newsgroups):
            table.add_row(
                newsgroup["name"],
                newsgroup["description"],
                newsgroup["last_updated"],
                str(newsgroup["total_first_last"]),
            )
        rich_console.print(table)
        print()


def main() -> None:
    newsgroups: dict[str, str] = get_newsgroups_from_plugins()
    time.sleep(5)  # Wait for the NNTP servers to start

    # Connect to both NNTP servers
    with (
        NNTPClient("localhost", 119) as src_nntp_client,
        NNTPClient("localhost", 1119) as dst_nntp_client,
    ):
        # Perform the NNTP sync every 5 seconds
        sync_cycle = 0
        try:
            while True:
                sync_cycle += 1
                print(f"{sync_cycle=} at {datetime.now(UTC)}")
                nntp_sync(src_nntp_client, dst_nntp_client, newsgroups)
                nntp_status(src_nntp_client, dst_nntp_client, newsgroups)
                time.sleep(5)  # Sleep for 5 seconds before the next sync
        except KeyboardInterrupt:
            print(f"nntp_sync() interrupted by user at {datetime.now(UTC)}")


if __name__ == "__main__":
    main()
