from pydantic import BaseModel


class Channel(BaseModel):
    name: str
    description: str


class ChannelSummary(BaseModel):
    name: str
    estimatedTotalArticles: int
    firstArticle: int
    lastArticle: int


class Metadata(BaseModel):
    title: str
    url: str
    description: str
    subject: str
    author: str
    alignment_tags: list[str]
    keywords: list[str]


class Card(BaseModel):
    number: int
    headers: dict
    subject: str
    body: Metadata | str


class NewCard(BaseModel):
    channels: list[str]
    subject: str
    body: Metadata


class CardRef(BaseModel):
    id: int
