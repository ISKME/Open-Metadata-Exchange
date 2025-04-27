#!/usr/bin/env -S uv run --script

# /// script
# requires-python = "==3.12"
# dependencies = [
#     "pydantic",
#     "pynntp",
# ]
# ///

"""
nntp_sync is workaround for greenbender/inn-docker#26 to keep the NNTP servers in sync.
"""

# import asyncio

import datetime
import nntplib  # Removed from the Python standard library in 3.12
import subprocess

import nntp

from server.get_ome_plugins import get_newsgroups

docker_exec_fmt = (
    'docker exec -it open-metadata-exchange-internetnews-server-{}-1 sh -c "{}"'
)

newsgroups = get_newsgroups()
print(f"{newsgroups=}")

command = " && ".join(f"ctlinnd newgroup {name}x" for name in newsgroups)
command = docker_exec_fmt.format("boston", command)
print(f"{command=}")

command = " && ".join(
    f"echo '{name:<23} {description.replace("'", '')}' >> db/newsgroups"
    for name, description in newsgroups.items()
)
command = docker_exec_fmt.format("boston", command)
print(f"{command=}")

completed_process = subprocess.run(  # noqa: S602
    command, capture_output=True, shell=True, check=True, text=True
)
print(f"{completed_process.stdout=}")

# subprocess.run(newsgroup.create_newsgroup())


# This includes newly created newsgroups.
nntplib_client = nntplib.NNTP("localhost")
for group_info in nntplib_client.newgroups(datetime.date(1970, 1, 1))[1]:
    print(f"{group_info=}")
print("-" * 20)

# This does NOT include newly created newsgroups!
pynntp_client = nntp.NNTPClient("localhost")
for name, description in sorted(pynntp_client.list_newsgroups()):
    print(f"{name=:<20}: {description=}")


def get_group_headers(newsgroup: str, nntp_client: nntp.NNTPClient) -> dict:
    count, first, last, name = nntp_client.group(newsgroup)
    return {
        header["Message-ID"]: (article_number, header)
        for article_number, header in src_client.xover((first, last))
    }


def sync_articles(
    article_numbers: list[int], src_client: nntp.NNTPClient, dst_client: nntp.NNTPClient
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
    newsgroups: list[str], src_client: nntp.NNTPClient, dst_client: nntp.NNTPClient
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
    # Connect to both NNTP servers
    src_client = nntp.NNTPClient("localhost", 119)
    dst_client = nntp.NNTPClient("localhost", 1119)

    # Perform the sync
    nntp_sync(newsgroups, src_client, dst_client)

    # Close the connections
    src_client.close()
    dst_client.close()
