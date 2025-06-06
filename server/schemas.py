from pydantic import BaseModel


class Channel(BaseModel):
    name: str
    description: str


class ChannelSummary(BaseModel):
    name: str
    estimated_total_articles: int
    first_article: int
    last_article: int


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


#######


class ResourceSummaryData(BaseModel):
    id: int
    name: str
    isShared: bool
    abstract: str
    educationLevels: list[str]
    micrositeName: str
    micrositeSlug: str
    numAlerts: int
    numResources: int
    numSubscribers: int
    subscribed: bool
    thumbnail: str
    updatedOn: str


class ChannelSummaryData(BaseModel):
    name: str
    slug: str
    educationLevels: list[str]
    logo: str | None
    numCollections: int


class ExploreSection(BaseModel):
    type: str
    name: str
    data: list[ChannelSummaryData | ResourceSummaryData]


class ClientInfo(BaseModel):
    name: str
    slug: str


class ResponseCode(BaseModel):
    code: int
    message: str


class UserInfo(BaseModel):
    email: str
    isAuthenticated: bool
    name: str


class ExploreSummary(BaseModel):
    sections: list[ExploreSection]
    response: ResponseCode
    userInfo: UserInfo
    clientInfo: ClientInfo
