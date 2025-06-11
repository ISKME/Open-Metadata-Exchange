import importlib
import os

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from server import ome_node
from server.helpers import MocAPI
from server.plugins.ome_plugin import OMEPlugin
from server.schemas import (
    Attachment,
    Card,
    CardRef,
    Channel,
    ChannelSummary,
    ExploreSummary,
    MiniMetadata,
    Post,
)


def _load_plugin(plugin_name: str) -> OMEPlugin:
    plugin_name = plugin_name.split(".")
    plugin_module_name = ".".join(plugin_name[:-1])
    plugin_class_name = plugin_name[-1]

    plugin_module = importlib.import_module(plugin_module_name)
    plugin_class = getattr(plugin_module, plugin_class_name)

    try:
        plugin = plugin_class()
    except ModuleNotFoundError:
        print(f"Failed to load plugin: {plugin_name}")
        return _load_plugin("server.plugins.ome_plugin.OMEPlugin")
    return plugin


def load_plugin() -> OMEPlugin:
    plugin = os.getenv("CMS_PLUGIN", "server.plugins.ome_plugin.OMEPlugin")
    return _load_plugin(plugin)


plugin = load_plugin()

unused = httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# If we are not running in Continuous Integration then enable the INN local.test group.
# if not os.getenv("CI"):  # Not running in Continuous Integration
#     ome_node.DEFAULT_NEWSGROUPS.remove(("local.test", "Local test group"))


@app.get("/api/list")
async def main() -> list[Channel]:
    print("Getting list of channels", flush=True)
    print(f"{tuple(ome_node.channels())=}", flush=True)
    return list(ome_node.channels())


@app.get("/api/channel/{name}")
async def get_channel_summary(name: str) -> ChannelSummary:
    return ome_node.channel_summary(name)


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
    metadata = plugin.make_metadata_card_from_url(meta.url)
    # TODO(anooparyal): create a more generic version of the metadata and add that
    # to the list of attachments
    post = Post(
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
    )
    sent = ome_node.create_post(post)
    print(f"Sent: {sent}")
    return sent


@app.post("/api/channel/{name}/import")
async def import_post(name: str, card: CardRef) -> bool:
    return ome_node.import_post(name, card.id)


@app.get("/newsgroups", response_class=HTMLResponse)
async def newsgroups(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "newsgroups.html",
        {
            "request": request,
            "newsgroups": [channel.name for channel in ome_node.channels()],
        },
    )


@app.get("/api/imls/v2/explore-oer-exchange/")
async def explore_oer_exchange(_request: Request) -> ExploreSummary:
    return ome_node.explore_summary()


app.mount(
    "/api/imls/",
    MocAPI(directory="static/api/imls/", html=True),
    name="Mock API",
)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
templates = Jinja2Templates(directory="templates")
print(f"Templates: {templates=}", flush=True)
print(f"{templates.env=}", flush=True)
print(f"{templates.get_template('newsgroups.html')=}", flush=True)
# print(f"Templates directory: {templates.directory=}", flush=True)
