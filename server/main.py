from datetime import UTC, datetime

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from server import ome_node
from server.helpers import MocAPI
from server.schemas import (
    Attachment,
    BrowseResponse,
    Card,
    CardRef,
    Channel,
    ChannelResourcesResponse,
    ChannelSummary,
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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    print("Getting list of channels", flush=True)
    print(f"{tuple(ome_node.channels())=}", flush=True)
    return list(ome_node.channels())


@app.get("/api/channel/{name}")
async def get_channel_synopsis(name: str) -> ChannelSummary:
    return get_channel_summary(name)


@app.get("/api/channel/{name}/cards")
async def get_channel_cards(
    name: str, page: int = 1, page_size: int = 10
) -> list[Card]:
    """
    http://localhost:5001/api/channel/eric.public/cards?page=2&page_size=25
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
    print(f"Sent: {sent}")
    return sent


@app.post("/api/channel/{name}/import")
async def import_post(name: str, card: CardRef) -> bool:
    return ome_node.import_post(name, card.id)


@app.get("/api/imls/v2/collections/browse/")
async def browse(sortby: str = "timestamp", per_page: int = 10) -> BrowseResponse:
    return browse_results(sortby, per_page)


@app.get("/api/imls/v2/explore-oer-exchange/")
async def explore_oer_exchange(_request: Request) -> ExploreSummary:
    return explore_summary()


@app.get("/api/imls/v2/collections/{channel}/{_id}")
async def channel_summary(channel: str, _id: int) -> ChannelSummaryResponse:
    return get_channel_summary(channel)


@app.get("/api/imls/v2/collections/{channel}/{_id}/resources")
async def get_channel(channel: str, _id: int) -> ChannelResourcesResponse:
    return get_channel_resources(channel)


@app.get("/api/imls/v2/resources/")
async def get_resources(tenant: str) -> ChannelResourcesResponse:
    return get_channel_resources(tenant)

app.mount(
    "/api/imls/",
    MocAPI(directory="static/api/imls/", html=True),
    name="Mock API",
)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
templates = Jinja2Templates(directory="templates")
# print(f"Templates directory: {templates.directory=}", flush=True)
