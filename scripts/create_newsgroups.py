#!/usr/bin/env -S uv run --script

# /// script
# requires-python = "==3.12"
# dependencies = [
#     "pydantic",
#     "pynntp",
# ]
# ///

"""
We have two NNTP servers Austin (the writer) and Boston (the city) to deemonstrate how
OME nodes can publish and subscribe to metadata in the peer-to-peer network.  Each OME
plugin has one or more newsgroups.

Once the NNTP servers have started, get the newsgroups required by all plugins and
creates those newsgroups on both NNTP servers.

Then run `nntp_sync()` every five seconds to sync the articles between the two servers.
NOTE: `nntp_sync()` is temporary workaround for greenbender/inn-docker#26.
"""

# import asyncio

import datetime
import subprocess
import time

from nntp import NNTPClient

from server.get_ome_plugins import get_newsgroups_from_plugins


def create_newsgroups(newsgroups: dict[str, str], nntp_server_name: str) -> str:
    """
    Create newsgroups on the NNTP server using `ctlinnd newgroup newsgroup` command.
    Then append newsgroup descriptions to the end of the `db/newsgroups` file.
    The complexity is that we need to run these commands in a Docker container.
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


def get_group_headers(newsgroup: str, nntp_client: NNTPClient) -> dict:
    count, first, last, name = nntp_client.group(newsgroup)
    return {
        header["Message-ID"]: (article_number, header)
        for article_number, header in src_client.xover((first, last))
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
    newsgroups: list[str], src_client: NNTPClient, dst_client: NNTPClient
) -> None:
    for newsgroup in newsgroups:
        print(f"Syncing newsgroup: {newsgroup}")

        # Select the group on both servers
        # src_info = src_client.group(group)
        # dst_info = dst_client.group(group)

        # Get list of articles (we'll use article numbers)
        # src_range = (src_info['first'], src_info['last'])
        # dst_range = (dst_info['first'], dst_info['last'])

        # Get sets of available article numbers
        src_articles = get_group_headers(newsgroup, src_client)
        print(f"{src_articles=}")
        dst_articles = get_group_headers(newsgroup, dst_client)
        print(f"{dst_articles=}")

        src_to_dst_articles = set(src_articles) - set(dst_articles)
        print(f"{len(src_to_dst_articles)=}: {src_to_dst_articles=}")
        article_numbers = sorted(
            article_number
            for message_id, (article_number, header) in src_articles.items()
            if message_id in src_to_dst_articles
        )
        print(f"{article_numbers=}")
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


if __name__ == "__main__":
    newsgroups = get_newsgroups_from_plugins()
    print(f"{newsgroups=}")
    time.sleep(5)  # Wait for the NNTP servers to start

    # Create newsgroups on both NNTP servers
    for nntp_server_name in ("austin", "boston"):
        print(f"Creating newsgroups on {nntp_server_name}")
        create_newsgroups(newsgroups, nntp_server_name)
    print("Newsgroups created")

    # Connect to both NNTP servers
    src_client = NNTPClient("localhost", 119)
    dst_client = NNTPClient("localhost", 1119)

    # Perform the NNTP sync every 5 seconds
    try:
        while True:
            nntp_sync(newsgroups, src_client, dst_client)
            time.sleep(5)  # Sleep for 5 seconds before the next sync
    except KeyboardInterrupt:
        print(
            f"nntp_sync() interrupted by user at {datetime.datetime.now(datetime.UTC)}"
        )

    # Close the connections
    src_client.close()
    dst_client.close()
