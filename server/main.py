import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from server import ome_node
from server.helpers import MocAPI
from server.schemas import Card, CardRef, Channel, ChannelSummary, NewCard

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# If we are not running in Continuous Integration then enable the INN local.test group.
if not os.getenv("CI"):  # Not running in Continuous Integration
    ome_node.DEFAULT_NEWSGROUPS.remove(("local.test", "Local test group"))


@app.get("/api/list")
async def main() -> list[Channel]:
    return ome_node.channels()


@app.get("/api/channel/{name}")
async def get_channel_summary(name: str) -> ChannelSummary:
    return ome_node.channel_summary(name)


@app.get("/api/channel/{name}/cards")
async def get_channel_cards(name: str, start: int = 1, end: int = 10) -> list[Card]:
    return ome_node.channelCards(name, start, end)


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
