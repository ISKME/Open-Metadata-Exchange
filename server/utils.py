from operator import attrgetter

from server.get_ome_plugins import get_ome_plugins
from server.ome_node import channel_summary, get_last_n_posts
from server.plugins.ome_plugin import OMEPlugin
from server.schemas import FilterItem, Post, ResourceSummaryData


def get_channels() -> (str, str, OMEPlugin):
    for plugin in get_ome_plugins():
        for slug, description in plugin.newsgroups.items():
            yield slug, description, plugin


def get_channels_filters() -> list[FilterItem]:
    channels = []
    for slug, description, plugin in get_channels():
        summary = channel_summary(slug)
        channel = FilterItem(
            name=description,
            slug=slug,
            isSelected=False,
            numResources=summary.estimated_total_articles,
            level=0,
            icons=[plugin.logo],
        )
        channels.append(channel)
    return channels


def get_latest_articles(num: int) -> list[Post]:
    articles = []
    for slug, _description, _plugin in get_channels():
        posts = get_last_n_posts(slug, num)
        articles.extend(posts)
    return sorted(articles, key=attrgetter("date"), reverse=True)[-num:]


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
