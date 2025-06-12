from datetime import datetime

from pydantic import BaseModel


class Channel(BaseModel):
    name: str
    description: str


class ChannelSummary(BaseModel):
    name: str
    estimated_total_articles: int
    first_article: int
    last_article: int


class MiniMetadata(BaseModel):
    url: str


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


class NewsgroupPost(BaseModel):
    id: int
    channel: str
    headers: dict
    body: str


class Attachment(BaseModel):
    filename: str
    mime_subtype: str
    data: bytes  # this might need to be a binary type
    # and not str


class Post(BaseModel):
    id: int | None
    channels: list[str]
    admin_contact: str
    subject: str
    body: str
    attachments: list[Attachment]
    date: datetime | None


class CardRef(BaseModel):
    id: int


#######


class ResourceSummaryData(BaseModel):
    id: int
    name: str
    abstract: str
    isShared: bool
    educationLevels: list[str]
    micrositeName: str
    micrositeSlug: str
    numAlerts: int
    numResources: int
    numSubscribers: int
    subscribed: bool
    thumbnail: str
    updatedOn: datetime


class ResourceDetailData(BaseModel):
    id: int
    title: str
    abstract: str
    source: str
    url: str | None
    metadata: list[str]
    thumbnail: str | None
    timestamp: datetime
    updatedDate: datetime
    detailURL: str | None
    grade_sublevel: list[str]
    accessibility: list[str]
    rating: int
    ratings_number: int
    site: str
    license: str
    license_cou_bucket: str
    license_types: list[str]
    license_bucket_title: str
    visits: int
    collections: list[str]


class ChannelSummaryData(BaseModel):
    name: str
    slug: str
    educationLevels: list[str]
    logo: str | None
    numCollections: int
    lastModified: datetime


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


class ResponseCodeExtended(ResponseCode):
    tenant: str
    request_schema: str
    all_tenants: bool
    shared_only: bool


class FilterItem(BaseModel):
    name: str
    slug: str
    isSelected: bool
    numResources: int
    level: int
    icons: list[str]


class Filter(BaseModel):
    name: str
    keyword: str
    items: list[FilterItem]


class UserInfo(BaseModel):
    email: str
    isAuthenticated: bool
    name: str


class SortOption(BaseModel):
    name: str
    slug: str


class PaginationOptions(BaseModel):
    count: int
    numPages: int
    page: int
    perPage: int
    perPageOptions: list[int]


class Collections(BaseModel):
    items: list[ResourceSummaryData]
    filters: list[Filter]
    sortBy: str
    sortByOptions: list[SortOption]
    pagination: PaginationOptions


class CollectionDetails(BaseModel):
    items: list[ResourceDetailData]
    filters: list[Filter]
    sortBy: str
    sortByOptions: list[SortOption]
    pagination: PaginationOptions


class ExploreSummary(BaseModel):
    sections: list[ExploreSection]
    response: ResponseCode
    userInfo: UserInfo
    clientInfo: ClientInfo


class BrowseResponse(BaseModel):
    collections: Collections
    response: ResponseCodeExtended
    userInfo: UserInfo
    clientInfo: ClientInfo


class ChannelSummaryResponse(BaseModel):
    collection: ResourceSummaryData
    response: ResponseCode
    userInfo: UserInfo
    clientInfo: ClientInfo


class ChannelResourcesResponse(BaseModel):
    resources: CollectionDetails
    response: ResponseCode
    userInfo: UserInfo
    clientInfo: ClientInfo
