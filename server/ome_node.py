#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "pydantic",
#     "pynntp",
#     "pondpond",
# ]
# ///

# PYTHONPATH="." server/ome_node.py

# import json
import os
from collections.abc import Iterator
from email import message_from_string
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import dateparser

from server.get_ome_plugins import get_newsgroups_from_plugins, load_plugin
from server.schemas import (
    Attachment,
    Channel,
    ChannelSummary,
    NewsgroupPost,
    Post,
)

from .connection_pool import ClientContextManager

AUSTIN_PORT = 119
BOSTON_PORT = AUSTIN_PORT + 1000
DEFAULT_NEWSGROUP_NAMES: set[str] = {
    "control.cancel",
    "control.checkgroups",
    "control.newgroup",
    "control.rmgroup",
    "control",
    "junk",
    "local.general",
    "local.test",
}

plugin = load_plugin()
    

def channels() -> Iterator[Channel]:
    """Rename this function to channels() and remove this function below when
    https://github.com/greenbender/pynntp/issues/95 is fixed.
    """
    with ClientContextManager() as nntp_client:
        ome_newsgroups = get_newsgroups_from_plugins()
        for name, _low, _high, _status in sorted(nntp_client.list_active()):
            #if description := ome_newsgroups.get(name):
            yield Channel(name=name, description=ome_newsgroups.get(name, ""))


def channel_summary(channel_name: str) -> ChannelSummary:
    with ClientContextManager() as nntp_client:
        est_total, first, last, name = nntp_client.group(channel_name)
        return ChannelSummary(
            name=name,
            estimated_total_articles=est_total,
            first_article=first,
            last_article=last,
        )


def create_post(post: Post) -> bool:
    with ClientContextManager() as nntp_client:
        message = MIMEMultipart()
        message["Subject"] = post.subject
        message["From"] = post.admin_contact
        
        body_part = MIMEText(post.body)
        message.attach(body_part)

        for attachment in post.attachments:
            message.attach(
                MIMEApplication(
                    attachment.data,
                    _subtype=attachment.mime_subtype,
                    Name=attachment.filename,
                )
            )

        # it's important that it's serialized before we look at the
        # headers because the boundary that's referenced in the headers is
        # figured out when it's first serialized
        msg = message.as_string().split("\n\n", 1)[1]
        
        headers = dict(message._headers)  # noqa: SLF001
        headers["Newsgroups"] = ",".join(post.channels)
        return nntp_client.post(headers=headers, body=msg)


def from_post(post: NewsgroupPost) -> Post:
    headers = {str(key): value for key, value in post.headers.items()}
    header_str = "\n".join([f"{key}: {value}" for key, value in headers.items()])
    whole_str = f"{header_str}\n\n{post.body}"

    attachments = []
    body = None
    message = message_from_string(whole_str)

    if message.is_multipart():
        for part in message.walk():
            if not part.is_multipart():
                content_type = part.get_content_type()
                if content_type == "text/plain" and not body:
                    body = part.get_payload(decode=True)
                # TODO(anooparyal): need to handle it better here and
                # handle other mime-types
                elif content_type == "application/json":
                    content = part.get_payload(decode=True)
                    attachments.append(
                        Attachment(
                            filename=part.get_filename(),
                            mime_subtype="json",
                            data=content,
                        )
                    )
    else:
        body = message.get_payload(decode=True)
    ds = headers.get("Date")
    date = dateparser.parse(ds)
    if not date:
        date = dateparser.parse("Wed, 1 Jan 2024 03:15:57 -0500")

    return Post(
        id=post.id,
        channels=[post.channel],
        admin_contact=headers.get("From", "missing"),
        subject=headers.get("Subject", "missing"),
        body=body,
        attachments=attachments,
        date=date,
    )


def get_post(channel: str, message_id: int) -> Post:
    with ClientContextManager() as nntp_client:
        nntp_client.group(channel)
        post_number, headers, body = nntp_client.article(message_id)
        return from_post(
            NewsgroupPost(id=post_number, channel=channel, headers=headers, body=body)
        )


def get_last_n_posts(channel: str, num: int = 3) -> Iterator[Post]:
    with ClientContextManager() as nntp_client:
        _est_total, first, last, _name = nntp_client.group(channel)
        start = max(last - num, first)
        for i in range(last, start - 1, -1):
            post_number, headers, body = nntp_client.article(i)
            yield from_post(
                NewsgroupPost(id=post_number, channel=channel, headers=headers, body=body)
            )


if __name__ == "__main__":
    import os

    # Environment variable INN_SERVER_NAME is defined in the docker-compose.yml file.
    print(f"{os.getenv('INN_SERVER_NAME', 'localhost')=}")
    print("Getting list of channels")
    nntp_client = get_client()
    print(f"{nntp_client=}")
    print("Getting list of channels")
    print(f"{tuple(channels())=}")
    print(channel_summary("local.test"))
    # print(create_post(NewCard(subject="test", body="test", channels=["local.test"])))
