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

from nntp import NNTPClient
from pydantic import ValidationError

from server.get_ome_plugins import get_newsgroups_from_plugins
from server.schemas import Card, Channel, ChannelSummary, Metadata, NewCard

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


def broken_channels() -> Iterator[Channel]:
    """Rename this function to channels() and remove this function below when
    https://github.com/greenbender/pynntp/issues/95 is fixed.
    """
    nntp_client = get_client()
    for name, description in sorted(nntp_client.list_newsgroups()):
        if name not in DEFAULT_NEWSGROUP_NAMES:
            yield Channel(name=name, description=description)


def channels() -> Iterator[Channel]:
    """Rename this function to channels() and remove this function below when
    https://github.com/greenbender/pynntp/issues/95 is fixed.
    """
    nntp_client = get_client()
    ome_newsgroups = get_newsgroups_from_plugins()
    for name, _low, _high, _status in sorted(nntp_client.list_active()):
        if description := ome_newsgroups.get(name):
            yield Channel(name=name, description=description)


def nntplib_channels() -> Iterator[Channel]:
    """Rename broken_channels() above to channels() and remove this function when
    https://github.com/greenbender/pynntp/issues/95 is fixed.
    """
    try:
        import datetime
        import nntplib  # Removed from the Python standard library in 3.12
    except ImportError:
        return broken_channels()

    # Environment variable INN_SERVER_NAME is defined in the docker-compose.yml file.
    inn_server_name = os.getenv("INN_SERVER_NAME", "localhost")
    # This includes newly created newsgroups.
    nntplib_client = nntplib.NNTP(inn_server_name)
    for group_info in nntplib_client.newgroups(datetime.date(1970, 1, 1))[1]:
        yield Channel(
            name=group_info.group,
            description=nntplib_client.description(group_info.group),
        )


def channel_summary(channel_name: str) -> ChannelSummary:
    nntp_client = get_client()
    est_total, first, last, name = nntp_client.group(channel_name)
    return ChannelSummary(
        name=name,
        estimated_total_articles=est_total,
        first_article=first,
        last_article=last,
    )


def _to_metadata(x: str | bytes | bytearray) -> Metadata | str | bytes | bytearray:
    try:
        return Metadata.model_validate_json(x)
    except ValidationError:
        return x


def channel_cards(channel_name: str, start: int, end: int) -> list[Card]:
    nntp_client = get_client()
    _, _first, last, _ = nntp_client.group(channel_name)
    end = min(end, last)
    return [
        Card(
            number=x[0],
            headers=x[1],
            subject=x[1]["Subject"],
            body=_to_metadata(x[2]),
        )
        for x in [nntp_client.article(i) for i in range(start, end + 1)]
    ]


def create_post(card: NewCard) -> bool:
    nntp_client = get_client()
    headers = {
        "Subject": card.subject,
        "From": "OERCommons <admin@oercommons.org>",
        "Newsgroups": ",".join(card.channels),
    }
    t = card.body.model_dump_json()
    return nntp_client.post(headers=headers, body=t)


def import_post(channel_name: str, card_id: int) -> bool:  # noqa: ARG001
    return True


if __name__ == "__main__":
    import os

    # Environment variable INN_SERVER_NAME is defined in the docker-compose.yml file.
    print(f"{os.getenv("INN_SERVER_NAME", "localhost")=}")
    print("Getting list of channels")
    nntp_client = get_client()
    print(f"{nntp_client=}")
    print("Getting list of channels")
    print(f"{tuple(channels())=}")
    print(channel_summary("local.test"))
    print(channel_cards("local.test", 1, 10))
    # print(create_post(NewCard(subject="test", body="test", channels=["local.test"])))
