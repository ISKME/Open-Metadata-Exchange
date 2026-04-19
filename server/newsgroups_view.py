import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from server import ome_node
from server.config import get_cors_middleware_kwargs
from server.helpers import MocAPI
from server.logging_config import configure_logging
from server.schemas import Card, CardRef, Channel, ChannelSummary, NewCard

configure_logging()
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(CORSMiddleware, **get_cors_middleware_kwargs())

# If we are not running in Continuous Integration then enable the INN local.test group.
if not os.getenv("CI"):  # Not running in Continuous Integration
    ome_node.DEFAULT_NEWSGROUPS.remove(("local.test", "Local test group"))


@app.get("/api/list")
async def main() -> list[Channel]:
    channels = list(ome_node.channels())
    logger.info("Listing channels: count=%d", len(channels))
    return channels


@app.get("/api/channel/{name}")
async def get_channel_summary(name: str) -> ChannelSummary:
    return ome_node.channel_summary(name)


@app.get("/api/channel/{name}/cards")
async def get_channel_cards(
    name: str, page: int = 1, page_size: int = 10
) -> list[Card]:
    """
    http://localhost:5001/api/channel/ome.eric/cards?page=2&page_size=25
    """
    start = (page - 1) * page_size + 1
    end = start + page_size - 1
    return ome_node.channel_cards(name, start, end)


@app.post("/api/publish")
async def create_post(card: NewCard) -> bool:
    return ome_node.create_post(card)


@app.post("/api/channel/{name}/import")
async def import_post(name: str, card: CardRef) -> bool:
    return ome_node.import_post(name, card.id)


app.mount(
    "/api/imls/",
    MocAPI(directory="static/api/imls/", html=True),
    name="Mock API",
)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
