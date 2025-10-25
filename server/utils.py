import math
from collections.abc import Iterable
from datetime import UTC, datetime, timedelta
from operator import attrgetter

from server.get_ome_plugins import get_ome_plugins
from server.ome_node import channel_summary, get_last_n_posts
from server.ome_node import plugin as site_plugin
from server.plugins.ome_plugin import OMEPlugin
from server.schemas import (
    BrowseResponse,
    ChannelResourcesResponse,
    ChannelSummaryData,
    ChannelSummaryResponse,
    ClientInfo,
    CollectionDetails,
    Collections,
    ExploreSection,
    ExploreSummary,
    Filter,
    FilterItem,
    PaginationOptions,
    Post,
    ResourceDetailData,
    ResourceSummaryData,
    ResponseCode,
    ResponseCodeExtended,
    SortOption,
    UserInfo,
)

sort_options = [
    SortOption(name="Relevance", slug="search"),
    SortOption(name="Title", slug="title"),
    SortOption(name="Title (DESC)", slug="-title"),
    SortOption(name="Most Popular", slug="visits"),
    SortOption(name="Date Updated", slug="timestamp"),
]


def get_channels() -> Iterable[tuple[str, str, OMEPlugin]]:
    for plugin in get_ome_plugins():
        for slug, description in plugin.newsgroups.items():
            yield slug, description, plugin


def get_channels_filters() -> Iterable[FilterItem]:
    for slug, description, plugin in get_channels():
        yield FilterItem(
            name=description,
            slug=slug,
            isSelected=False,
            numResources=channel_summary(slug).estimated_total_articles,
            level=0,
            icons=[plugin.logo],
        )


def get_latest_articles(num: int) -> list[Post]:
    articles = []
    for slug, _description, _plugin in get_channels():
        posts = get_last_n_posts(slug, num)
        articles.extend(posts)
    return sorted(articles, key=attrgetter("date"), reverse=True)[-num:]


def get_active_channels(num: int = -1) -> list[ChannelSummaryData]:
    channels = []
    for slug, description, plugin in get_channels():
        summary = channel_summary(slug)
        posts = list(get_last_n_posts(slug, 1))
        latest_post = posts[0] if posts else None
        channel = ChannelSummaryData(
            id=0,
            name=description,
            slug=slug,
            educationLevels=[],
            logo=plugin.logo,
            numCollections=summary.estimated_total_articles,
            lastModified=latest_post.date
            if latest_post
            else datetime.now(tz=UTC) - timedelta(days=365),
        )
        channels.append(channel)
    channels = sorted(channels, key=attrgetter("lastModified"), reverse=True)
    if num != -1:
        channels = channels[-num:]
    return channels


def explore_summary() -> ExploreSummary:
    plugin = site_plugin
    resources = ExploreSection(type="Collections", name="All shared resources", data=[])
    channels = ExploreSection(type="Microsites", name="By Channels", data=[])

    channels.data.extend(get_active_channels(10))

    return ExploreSummary(
        clientInfo=ClientInfo(
            name=plugin.site_name, slug=next(iter(list(plugin.newsgroups.keys())))
        ),
        response=ResponseCode(code=200, message="Successful Operation"),
        sections=[resources, channels],
        userInfo=UserInfo(
            email=plugin.librarian_contact,
            isAuthenticated=True,
            name=f"{plugin.site_name} Librarian",
        ),
    )


def post_to_summary(post: Post) -> ResourceSummaryData:
    return ResourceSummaryData(
        id=post.id,
        name=post.subject,
        abstract=post.body,
        isShared=True,
        educationLevels=[],
        micrositeName=post.channels[0],
        micrositeSlug=post.channels[0],
        numAlerts=0,
        numResources=len(post.attachments),
        numSubscribers=0,
        subscribed=False,
        thumbnail="",
        updatedOn=post.date,
    )


def post_to_details(post: Post) -> ResourceDetailData:
    return ResourceDetailData(
        id=post.id,
        title=post.subject,
        abstract=post.body,
        source="Course Related Material",
        url=None,
        metadata=[],
        thumbnail=None,
        timestamp=post.date,
        updatedDate=post.date,
        detailURL=f"/api/imls/v2/resources/qubes.public/materials/{post.id}",
        grade_sublevel=["High School"],
        accessibility=[],
        rating=0,
        ratings_number=0,
        site=post.channels[0],
        license="educational-use-permitted",
        license_cou_bucket="read-the-fine-print",
        license_types=["read-the-fine-print", "educational-use-permitted"],
        license_bucket_title="Read the Fine Print",
        visits=22,
        collections=post.channels,
    )


def browse_results(sortby: str = "timestamp", per_page: int = 10) -> BrowseResponse:
    plugin = site_plugin
    total_num_articles = 124
    plugin_by_slug = {slug: plugin for slug, _description, plugin in get_channels()}
    latest = [post_to_summary(x) for x in get_latest_articles(per_page)]
    for item in latest:
        item.thumbnail = plugin_by_slug[item.micrositeSlug].logo

    tenant_slug = next(iter(plugin.newsgroups.keys()))
    return BrowseResponse(
        collections=Collections(
            items=latest,
            filters=[
                Filter(name="Channel", keyword="channel", items=get_channels_filters())
            ],
            sortBy=sortby,
            sortByOptions=sort_options,
            pagination=PaginationOptions(
                count=total_num_articles,  # TODO(anooparyal): get the
                # total count of articles
                # available
                numPages=math.ceil(total_num_articles / per_page),
                page=1,
                perPage=per_page,
                perPageOptions=[10, 30, 50],
            ),
        ),
        response=ResponseCodeExtended(
            code=200,
            message="Successful operation",
            tenant=tenant_slug,
            request_schema=tenant_slug,
            all_tenants=True,
            shared_only=True,
        ),
        userInfo=UserInfo(
            email=plugin.librarian_contact, isAuthenticated=True, name=""
        ),
        clientInfo=ClientInfo(name=plugin.site_name, slug=tenant_slug),
    )


def get_channel_summary(
    channel_slug: str, _per_page: int = 3, _sortby: str = "timestamp"
) -> ChannelSummaryResponse:
    plugin = site_plugin
    plugin_by_slug = {slug: plugin for slug, _description, plugin in get_channels()}

    channel_plugin = plugin_by_slug[channel_slug]

    tenant_slug = next(iter(plugin.newsgroups.keys()))
    return ChannelSummaryResponse(
        collection=ResourceSummaryData(
            id=0,
            name="",
            abstract="",
            isShared=True,
            educationLevels=[
                "College / Upper Division",
                "Community College / Lower Division",
                "High School",
            ],
            micrositeName=channel_plugin.site_name,
            micrositeSlug=channel_slug,
            numAlerts=0,
            numResources=100,
            numSubscribers=0,
            subscribed=False,
            thumbnail=channel_plugin.logo,
            updatedOn=datetime.now(tz=UTC),
        ),
        response=ResponseCode(code=200, message="Successful operation"),
        userInfo=UserInfo(
            email=plugin.librarian_contact, isAuthenticated=True, name=""
        ),
        clientInfo=ClientInfo(name=plugin.site_name, slug=tenant_slug),
    )


def get_channel_resources(
    channel_slug: str, per_page: int = 10, sortby: str = "timestamp"
) -> ChannelResourcesResponse:
    plugin = site_plugin
    total_num_articles = 124
    plugin_by_slug = {slug: plugin for slug, _description, plugin in get_channels()}
    latest = [post_to_details(x) for x in get_last_n_posts(channel_slug, per_page)]
    for item in latest:
        item.thumbnail = plugin_by_slug[item.site].logo

    tenant_slug = next(iter(plugin.newsgroups.keys()))
    return ChannelResourcesResponse(
        resources=CollectionDetails(
            items=latest,
            filters=[
                Filter(
                    name="Subject Area",
                    keyword="subject",
                    items=[
                        FilterItem(
                            name="Applied Science",
                            slug="applied-science",
                            isSelected=False,
                            numResources=10,
                            level=0,
                            icons=[],
                        ),
                        FilterItem(
                            name="Life Science",
                            slug="life-science",
                            isSelected=False,
                            numResources=10,
                            level=0,
                            icons=[],
                        ),
                    ],
                ),
                Filter(
                    name="Education Level",
                    keyword="education-level",
                    items=[
                        FilterItem(
                            name="High School",
                            slug="high-school",
                            isSelected=False,
                            numResources=11,
                            level=0,
                            icons=[],
                        ),
                        FilterItem(
                            name="College / Upper Division",
                            slug="college-upper-division",
                            isSelected=False,
                            numResources=12,
                            level=0,
                            icons=[],
                        ),
                    ],
                ),
            ],
            sortBy=sortby,
            sortByOptions=sort_options,
            pagination=PaginationOptions(
                count=total_num_articles,  # TODO(anooparyal): get the
                # total count of articles
                # available
                numPages=math.ceil(total_num_articles / per_page),
                page=1,
                perPage=per_page,
                perPageOptions=[3, 9, 30, 90],
            ),
        ),
        response=ResponseCode(code=200, message="Successful operation"),
        userInfo=UserInfo(
            email=plugin.librarian_contact, isAuthenticated=True, name=""
        ),
        clientInfo=ClientInfo(name=plugin.site_name, slug=tenant_slug),
    )
