import logging
from datetime import UTC, datetime

import httpx
from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from server import ome_node
from server.config import get_cors_middleware_kwargs
from server.helpers import MocAPI
from server.logging_config import configure_logging
from server.rate_limit import create_limiter
from server.schemas import (
    Attachment,
    BrowseResponse,
    Card,
    CardRef,
    Channel,
    ChannelResourcesResponse,
    ChannelSummaryResponse,
    ExploreSummary,
    MiniMetadata,
    Post,
)
from server.utils import (
    browse_results,
    explore_summary,
    get_channel_resources,
    get_channel_summary,
)

unused = httpx

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI()

# Per-IP rate limit — configurable via OME_RATE_LIMIT. See issue #5.
app.state.limiter = create_limiter()
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(CORSMiddleware, **get_cors_middleware_kwargs())


@app.get("/channels", response_class=HTMLResponse)
async def show_channels(request: Request) -> HTMLResponse:
    channels = ome_node.channels()
    channel_list = [ome_node.channel_summary(channel.name) for channel in channels]
    return templates.TemplateResponse(
        "channels.html",
        {"request": request, "channels": channel_list},
    )


@app.get("/channel/{channel_name:str}")
async def show_channel_details(request: Request, channel_name: str) -> HTMLResponse:
    summary = ome_node.channel_summary(channel_name)
    posts = list(ome_node.get_last_n_posts(channel_name, 10))
    return templates.TemplateResponse(
        "channel_details.html",
        {"request": request, "channel_summary": summary, "posts": posts},
    )


@app.get("/api/list")
async def main() -> list[Channel]:
    channels = list(ome_node.channels())
    logger.info("Listing channels: count=%d", len(channels))
    return channels


@app.get("/api/channel/{name}")
async def get_channel_synopsis(name: str) -> ChannelSummaryResponse:
    # Return annotation corrected from ChannelSummary (the raw NNTP
    # summary) to ChannelSummaryResponse (what `utils.get_channel_summary`
    # actually returns). Uncovered until issue #6 added TestClient
    # coverage — FastAPI's response validator rejected real calls.
    return get_channel_summary(name)


@app.get("/api/channel/{name}/cards")
async def get_channel_cards(
    name: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=200),
) -> list[Card]:
    """
    http://localhost:5001/api/channel/ome.eric/cards?page=2&page_size=25
    """
    start = (page - 1) * page_size + 1
    end = start + page_size - 1
    return ome_node.channel_cards(name, start, end)


@app.post("/api/publish_url")
async def create_post(meta: MiniMetadata) -> bool:
    plugin = ome_node.plugin
    metadata = plugin.make_metadata_card_from_url(meta.url)
    # TODO(anooparyal): create a more generic version of the metadata and add that
    # to the list of attachments
    post = Post(
        id=None,
        channels=plugin.newsgroups.keys(),
        admin_contact=plugin.librarian_contact,
        subject=metadata.title,
        body=plugin.summarize(metadata),
        attachments=[
            Attachment(
                mime_subtype="json",
                filename="metadata.json",
                data=metadata.model_dump_json(),
            )
        ],  # add the other generic metadata here
        date=datetime.now(tz=UTC),
    )
    sent = ome_node.create_post(post)
    logger.info("Post submitted: subject=%r sent=%s", metadata.title, sent)
    return sent


@app.post("/api/channel/{name}/import")
async def import_post(name: str, card: CardRef) -> bool:
    return ome_node.import_post(name, card.id)


@app.get("/api/imls/v2/collections/browse/")
async def browse(
    sortby: str = "timestamp",
    per_page: int = Query(default=10, ge=1, le=200),
    page: int = Query(default=1, ge=1),
) -> BrowseResponse:
    return browse_results(sortby=sortby, per_page=per_page, page=page)


@app.get("/api/imls/v2/explore-oer-exchange/")
async def explore_oer_exchange(_request: Request) -> ExploreSummary:
    return explore_summary()


@app.get("/api/imls/v2/collections/{channel}/{_id}")
async def channel_summary(channel: str, _id: int) -> ChannelSummaryResponse:
    return get_channel_summary(channel)


@app.get("/api/imls/v2/collections/{channel}/{_id}/resources")
async def get_channel(
    channel: str,
    _id: int,
    per_page: int = Query(default=10, ge=1, le=200),
    sortby: str = "timestamp",
    page: int = Query(default=1, ge=1),
) -> ChannelResourcesResponse:
    return get_channel_resources(channel, per_page=per_page, sortby=sortby, page=page)


@app.get("/api/imls/v2/resources/")
async def get_resources(
    tenant: str,
    per_page: int = Query(default=10, ge=1, le=200),
    sortby: str = "timestamp",
    page: int = Query(default=1, ge=1),
) -> ChannelResourcesResponse:
    return get_channel_resources(tenant, per_page=per_page, sortby=sortby, page=page)


app.mount(
    "/api/imls/",
    MocAPI(directory="static/api/imls/", html=True),
    name="Mock API",
)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
templates = Jinja2Templates(directory="templates")
# print(f"Templates directory: {templates.directory=}", flush=True)
