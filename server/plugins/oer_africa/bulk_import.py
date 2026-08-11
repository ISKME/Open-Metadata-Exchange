#!/usr/bin/env -S uv run --script

# Source: https://www.oerafrica.org/search/site?search_api_views_fulltext=Milk&_format=json
# Docs:   https://www.oerafrica.org/jsonapi

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
#     "pydantic",
# ]
# ///

import asyncio
import json
from collections.abc import Iterator
from pathlib import Path

import httpx

from server.plugins.oer_africa.oer_africa_models import OERAFricaResource
from server.plugins.oer_africa.plugin import OERAFricaPlugin
from server.plugins.ome_plugin import EducationResource

plugin = OERAFricaPlugin()

_PLUGIN_DIR = Path(__file__).resolve().parent

# Drupal JSON:API endpoint — returns resources matching the search term "Milk"
# https://www.oerafrica.org/jsonapi/node/resource?
#   filter[fulltext]=Milk&page[limit]=50&sort=-changed
SEARCH_TERM = "Milk"
API_URL = (
    "https://www.oerafrica.org/jsonapi/node/resource"
    f"?filter[fulltext]={SEARCH_TERM}&page[limit]=50&sort=-changed"
)


def bulk_translate(resources: list[dict]) -> Iterator[EducationResource]:
    yield from (plugin.make_metadata_card_from_dict(r) for r in resources)


def bulk_translate_to_json(resources: list[dict]) -> str:
    """Translate a list of OER Africa resource dicts into a JSON list string."""
    cards_as_json = (
        card.model_dump_json(indent=2) for card in bulk_translate(resources)
    )
    return f"[\n{',\n'.join(cards_as_json)}\n]"


async def _fetch_raw(url: str) -> str:
    async with httpx.AsyncClient() as httpx_async_client:
        response = await httpx_async_client.get(url)
        response.raise_for_status()
        return response.text


async def bulk_import_async(url: str = API_URL) -> list:
    """
    Fetch OER Africa resources and write OME metadata records.

    Cached raw API response is stored in oer_africa_bulk.json.
    Translated OME metadata is stored in oer_africa_ome_metadata.json.
    """
    here = _PLUGIN_DIR
    raw_path = here / "oer_africa_bulk.json"
    ome_path = here / "oer_africa_ome_metadata.json"

    if not raw_path.exists():
        raw_path.write_text(await _fetch_raw(url))

    if not ome_path.exists():
        payload = json.loads(raw_path.read_text())
        # Drupal JSON:API wraps results in a "data" key; fall back to a bare list
        resources = (
            payload.get("data", payload) if isinstance(payload, dict) else payload
        )
        # Filter to only node--resource entries
        resources = [
            r for r in resources if OERAFricaResource(**r).type == "node--resource"
        ]
        ome_path.write_text(bulk_translate_to_json(resources))

    return json.loads(ome_path.read_text())


def bulk_import(url: str = API_URL) -> list:
    """Synchronous wrapper around bulk_import_async."""
    return asyncio.run(bulk_import_async(url))


if __name__ == "__main__":
    print(f"{bulk_import() = }")
