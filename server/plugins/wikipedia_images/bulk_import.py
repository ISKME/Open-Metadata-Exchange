#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx2",
#     "pydantic",
# ]
# ///

"""
Bulk import of images and their metadata from English Wikipedia.

Uses the public MediaWiki Action API (JSON) at https://en.wikipedia.org/w/api.php
and the Wikipedia REST API (``/api/rest_v1/page/media-list``). Images from the
French Polynesia article and a map for each of its 10 most populated islands are
downloaded to ``wikipedia_images/`` and cached metadata is written to
``wikipedia_images_resources.json``.
"""

import asyncio
import html
import re
from datetime import datetime
from pathlib import Path

import httpx2

from server.plugins.wikipedia_images.wikipedia_images_models import (
    WikipediaImagesItem,
    WikipediaImagesModel,
)

API_URL = "https://en.wikipedia.org/w/api.php"
REST_URL = "https://en.wikipedia.org/api/rest_v1/page/media-list/"
HEADERS = {
    "User-Agent": "OME-Bot/1.0 (https://github.com/ISKME/Open-Metadata-Exchange)"
}
MAIN_PAGE = "French_Polynesia"
# The 10 most populated islands of French Polynesia, most populated first.
ISLANDS = (
    "Tahiti",
    "Moorea",
    "Raiatea",
    "Bora_Bora",
    "Huahine",
    "Taha'a",
    "Nuku_Hiva",
    "Rangiroa",
    "Hiva_Oa",
    "Ua_Pou",
)
_HERE = Path(__file__).resolve().parent
_CACHE = _HERE / "wikipedia_images_resources.json"
_IMAGES = _HERE / "wikipedia_images"
_IMAGE_SUFFIXES = (".jpg", ".jpeg", ".png", ".svg", ".gif", ".webp")
_TAGS = re.compile(r"<[^>]+>")


def _text(extmetadata: dict, key: str) -> str:
    value = extmetadata.get(key, {}).get("value", "")
    return html.unescape(_TAGS.sub("", str(value))).strip()


def _parse_date(value: str) -> datetime | None:
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


async def list_page_images(
    httpx_async_client: httpx2.AsyncClient, page: str
) -> list[str]:
    """Return the ``File:`` titles of all images on a Wikipedia page."""
    data = (
        (await httpx_async_client.get(REST_URL + page, headers=HEADERS))
        .raise_for_status()
        .json()
    )
    return [
        title
        for item in data.get("items", [])
        if item.get("type") == "image"
        and (title := item.get("title", "")).lower().endswith(_IMAGE_SUFFIXES)
    ]


async def fetch_image_items(
    httpx_async_client: httpx2.AsyncClient, titles: list[str], page: str
) -> list[WikipediaImagesItem]:
    """Fetch image metadata for ``File:`` titles (max 50 per request)."""
    items: list[WikipediaImagesItem] = []
    for start in range(0, len(titles), 50):
        params = {
            "action": "query",
            "format": "json",
            "prop": "imageinfo",
            "iiprop": "url|extmetadata",
            "iiurlwidth": 1280,
            "titles": "|".join(
                f"File:{t.removeprefix('File:')}" for t in titles[start : start + 50]
            ),
        }
        data = (
            (await httpx_async_client.get(API_URL, params=params, headers=HEADERS))
            .raise_for_status()
            .json()
        )
        for entry in data.get("query", {}).get("pages", {}).values():
            if not (infos := entry.get("imageinfo")):
                continue
            info = infos[0]
            meta = info.get("extmetadata", {})
            name = entry["title"]
            items.append(
                WikipediaImagesItem(
                    id=name,
                    title=name.removeprefix("File:").rsplit(".", 1)[0],
                    description=_text(meta, "ImageDescription"),
                    url=info.get("thumburl") or info["url"],
                    page_url=info.get("descriptionurl", ""),
                    source_page=page.replace("_", " "),
                    authors=[a] if (a := _text(meta, "Artist")) else [],
                    subjects=[page.replace("_", " ")],
                    license=_text(meta, "LicenseShortName"),
                    date=_parse_date(_text(meta, "DateTimeOriginal")),
                )
            )
    return items


async def download(
    httpx_async_client: httpx2.AsyncClient, item: WikipediaImagesItem
) -> None:
    """Download the image to ``wikipedia_images/`` and record its path."""
    _IMAGES.mkdir(exist_ok=True)
    suffix = Path(item.url.split("?")[0]).suffix or ".img"
    filename = re.sub(r"[^\w.-]+", "_", f"{item.source_page}_{item.title}") + suffix
    if not (path := _IMAGES / filename).exists():
        response = await httpx_async_client.get(
            item.url, headers=HEADERS, follow_redirects=True
        )
        path.write_bytes(response.raise_for_status().content)
    item.local_file = f"wikipedia_images/{filename}"


async def bulk_import() -> list[WikipediaImagesItem]:
    """Return image records for French Polynesia plus a map per island (cached)."""
    if _CACHE.exists():
        return WikipediaImagesModel.model_validate_json(_CACHE.read_text()).root
    async with httpx2.AsyncClient(
        timeout=60, follow_redirects=True
    ) as httpx_async_client:
        main_titles = await list_page_images(httpx_async_client, MAIN_PAGE)
        items = await fetch_image_items(httpx_async_client, main_titles, MAIN_PAGE)
        for island in ISLANDS:
            titles = await list_page_images(httpx_async_client, island)
            maps = [t for t in titles if "map" in t.lower()]
            if maps:
                items += await fetch_image_items(httpx_async_client, maps[:1], island)
        await asyncio.gather(*(download(httpx_async_client, i) for i in items))
    _CACHE.write_text(WikipediaImagesModel(root=items).model_dump_json(indent=2))
    return items


if __name__ == "__main__":

    async def _main() -> None:
        for i, item in enumerate(await bulk_import(), start=1):
            print(f"{i:>2}. {item.title!r}")

    asyncio.run(_main())
