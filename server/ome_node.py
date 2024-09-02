import nntp
from server.schemas import Channel, ChannelSummary, Card, NewCard, Metadata
# import json


def getClient():
    client = nntp.NNTPClient("localhost", 119, use_ssl=False)
    return client


def channels() -> list[Channel]:
    client = getClient()
    suppress = {
        "control",
        "control.cancel",
        "control.checkgroups",
        "control.newgroup",
        "control.rmgroup",
        "junk",
        "local.general",
        "local.test",
    }
    return [
        Channel(name=x[0], description=x[1])
        for x in client.list_newsgroups()
        if x[0] not in suppress
    ]


def channelSummary(channelName: str) -> ChannelSummary:
    client = getClient()
    estTotal, first, last, name = client.group(channelName)
    return ChannelSummary(
        name=name, estimatedTotalArticles=estTotal, firstArticle=first, lastArticle=last
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
