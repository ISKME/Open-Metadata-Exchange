#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "pydantic",
#     "pynntp",
# ]
# ///

# PYTHONPATH="." server/ome_node.py

# import json
import os
from collections.abc import Iterator
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from nntp import NNTPClient

from server.get_ome_plugins import get_newsgroups_from_plugins
from server.schemas import (
    Channel,
    ChannelSummary,
    ChannelSummaryData,
    ClientInfo,
    ExploreSection,
    ExploreSummary,
    Post,
    ResponseCode,
    UserInfo,
)

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

# TODO(anooparyal): implement a connection pool here.. that is able to
# discard closed connections.
CLIENT: NNTPClient | None = None


def get_client(port: int = 119) -> NNTPClient:
    global CLIENT
    if CLIENT:
        return CLIENT

    # Environment variable INN_SERVER_NAME is defined in the docker-compose.yml file.
    inn_server_name = os.getenv("INN_SERVER_NAME", "localhost")
    if port == BOSTON_PORT:  # Special case for localhost accessing Boston container.
        inn_server_name = "localhost"
    print(f"{__file__}.get_client({port=}) on {inn_server_name}")
    return (CLIENT := NNTPClient(inn_server_name, port=port))


def channels() -> Iterator[Channel]:
    """Rename this function to channels() and remove this function below when
    https://github.com/greenbender/pynntp/issues/95 is fixed.
    """
    nntp_client = get_client()
    ome_newsgroups = get_newsgroups_from_plugins()
    for name, _low, _high, _status in sorted(nntp_client.list_active()):
        if description := ome_newsgroups.get(name):
            yield Channel(name=name, description=description)


def channel_summary(channel_name: str) -> ChannelSummary:
    nntp_client = get_client()
    est_total, first, last, name = nntp_client.group(channel_name)
    return ChannelSummary(
        name=name,
        estimated_total_articles=est_total,
        first_article=first,
        last_article=last,
    )


def create_post(post: Post) -> bool:
    nntp_client = get_client()
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


def import_post(channel_name: str, card_id: int) -> bool:  # noqa: ARG001
    return True


def explore_summary() -> ExploreSummary:
    nntp_client = get_client()

    ome_newsgroups = get_newsgroups_from_plugins()

    channels = ExploreSection(type="Microsites", name="By Channels", data=[])
    # resources = ExploreSection(type="Collections", name="All shared
    # resources", data=[])

    for name, _low, _high, _status in sorted(nntp_client.list_active()):
        if description := ome_newsgroups.get(name):
            est_total, _first, _last, _name = nntp_client.group(name)
            channels.data.append(
                ChannelSummaryData(
                    name=description,
                    slug=name,
                    educationLevels=[
                        "Upper Primary",
                        "Career / Technical",
                        "Adult Education",
                        "High School",
                        "Preschool",
                        "Lower Primary",
                        "Middle School",
                    ],
                    logo=None,
                    numCollections=est_total,
                )
            )

    return ExploreSummary(
        clientInfo=ClientInfo(name="Austin Library", slug="austin"),
        response=ResponseCode(code=200, message="Successful Operation"),
        sections=[channels],
        userInfo=UserInfo(
            email="info@iskme.org", isAuthenticated=True, name="ISKME Librarian"
        ),
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
