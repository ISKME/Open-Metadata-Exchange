import nntplib
from typing import Iterator
from server.schemas import Channel, ChannelSummary, Card, NewCard, Metadata
# import json


DEFAULT_NEWSGROUPS = {
    "control",
    "control.cancel",
    "control.checkgroups",
    "control.newgroup",
    "control.rmgroup",
    "junk",
    "local.general",
    "local.test",
}


def getClient() -> nntplib.NNTP:
    client = nntplib.NNTP("localhost", readermode=True)
    return client


def channels() -> Iterator[Channel]:
    client = getClient()
    newsgroups = sorted(
        {newsgroup.group for newsgroup in client.list()[1]} - DEFAULT_NEWSGROUPS
    )
    for newsgroup in newsgroups:
        yield Channel(name=newsgroup, description=client.description(newsgroup))


def channelSummary(channelName: str) -> ChannelSummary:
    client = getClient()
    response, count, first, last, name = client.group(channelName)
    return ChannelSummary(
        name=name, estimatedTotalArticles=count, firstArticle=first, lastArticle=last
    )


def _to_metadata(x):
    try:
        return Metadata.model_validate_json(x)
    except ValueError:
        return x


def channelCards(channelName: str, start: int, end: int) -> list[Card]:
    client = getClient()
    _, first, last, _ = client.group(channelName)
    if end > last:
        end = last
    return [
        Card(
            number=x[0], headers=x[1], subject=x[1]["Subject"], body=_to_metadata(x[2])
        )
        for x in [client.article(i) for i in range(start, end + 1)]
    ]


def createPost(card: NewCard):
    client = getClient()
    headers = {
        "Subject": card.subject,
        "From": "OERCommons <admin@oercommons.org>",
        "Newsgroups": ",".join(card.channels),
    }
    t = card.body.model_dump_json()
    return client.post(headers=headers, body=t)


def importPost(channelName: str, cardId: int) -> bool:
    return True
