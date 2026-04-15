import json
from datetime import datetime
from functools import cache
from pathlib import Path

from pydantic import BaseModel, field_validator

SPDX_LICENSES_JSON = Path(__file__).with_name("spdx_licenses.json")


@cache
def _spdx_license_id_to_name_map() -> dict[str, str]:
    with SPDX_LICENSES_JSON.open(encoding="utf-8") as spdx_file:
        spdx_licenses = json.load(spdx_file)
    return {
        license_info["licenseId"]: license_info["name"]
        for license_info in spdx_licenses["licenses"]
    }


def spdx_id_to_full_name(spdx_license_id: str) -> str:
    full_name = _spdx_license_id_to_name_map().get(spdx_license_id)
    if full_name is None:
        msg = f"Invalid SPDX license identifier: {spdx_license_id}"
        raise ValueError(msg)
    return full_name


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
    spdx_license: str
    alignment_tags: list[str]
    keywords: list[str]

    @field_validator("spdx_license")
    @classmethod
    def validate_spdx_license(cls, spdx_license: str) -> str:
        """Validate that the SPDX identifier exists in the SPDX license list."""
        spdx_id_to_full_name(spdx_license)
        return spdx_license


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
