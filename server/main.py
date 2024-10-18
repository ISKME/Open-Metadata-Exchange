from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from server import ome_node
from server.schemas import ChannelSummary, Card, NewCard, CardRef

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/channel/{name}")
async def getChannelSummary(name: str) -> ChannelSummary:
    return ome_node.channelSummary(name)


@app.get("/api/channel/{name}/cards")
async def getChannelCards(name: str, start: int = 1, end: int = 10) -> list[Card]:
    return ome_node.channelCards(name, start, end)


@app.post("/api/publish")
async def createPost(card: NewCard):
    return ome_node.createPost(card)


@app.post("/api/channel/{name}/import")
async def importPost(name: str, card: CardRef) -> bool:
    return ome_node.importPost(name, card.id)


app.mount("/", StaticFiles(directory="static", html=True), name="static")
