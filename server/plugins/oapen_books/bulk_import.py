#!/usr/bin/env -S uv run --script
#
# Source: https://library.oapen.org/rest/
#
# Uses the OAPEN Library public DSpace REST API to fetch open-access book
# metadata.  The API returns structured JSON — no web scraping required.
#
# Sample query (50 Python books):
#   GET https://library.oapen.org/rest/search
#       ?query=python+programming&limit=50&expand=metadata
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
#     "pydantic",
# ]
# ///

import asyncio
import json
import logging
from collections.abc import Iterator
from pathlib import Path

import httpx

from server.plugins.oapen_books.oapen_models import OapenItem, OapenSearchResponse
from server.plugins.oapen_books.plugin import OapenBooksPlugin
from server.plugins.ome_plugin import EducationResource

OAPEN_REST_URL = "https://library.oapen.org/rest/search"
DEFAULT_LIMIT = 50

logger = logging.getLogger(__name__)

plugin = OapenBooksPlugin()


async def fetch_books(
    query: str,
    limit: int = DEFAULT_LIMIT,
    offset: int = 0,
) -> list[OapenItem]:
    """
    Fetch open-access books from the OAPEN Library REST API.

    Args:
        query: Search query string (e.g. ``"python programming"``).
        limit: Maximum number of results to return (default 50).
        offset: Pagination offset (default 0).

    Returns:
        A list of :class:`OapenItem` records.

    Raises:
        RuntimeError: If the API request fails.
    """
    params: dict[str, str | int] = {
        "query": query,
        "limit": limit,
        "offset": offset,
        "expand": "metadata",
    }
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=30.0
    ) as httpx_async_client:
        try:
            response = await httpx_async_client.get(OAPEN_REST_URL, params=params)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            status_code = (
                exc.response.status_code
                if isinstance(exc, httpx.HTTPStatusError)
                else "N/A"
            )
            msg = (
                f"Failed to fetch books from OAPEN Library REST API: "
                f"{OAPEN_REST_URL} (Status: {status_code}). {exc!s}"
            )
            raise RuntimeError(msg) from exc

        return OapenSearchResponse.model_validate(response.json()).root


def bulk_translate(items: list[dict]) -> Iterator[EducationResource]:
    """Translate a list of raw OAPEN item dicts to OME EducationResource cards."""
    yield from (plugin.make_metadata_card_from_dict(item) for item in items)


def bulk_import(
    query: str = "python programming",
    limit: int = DEFAULT_LIMIT,
    cache_path: Path | None = None,
) -> list[dict]:
    """
    Fetch OAPEN books by search query and cache results locally.

    On the first run the function calls the OAPEN REST API and writes the
    results to *cache_path*.  Subsequent calls read from the cache so that
    the network is not hit again.

    Args:
        query: Search query passed to the OAPEN REST API.
        limit: Maximum number of results to fetch from the API.
        cache_path: Path for the local JSON cache.  Defaults to
            ``oapen_python_books.json`` next to this file.

    Returns:
        A list of serialised :class:`~server.plugins.ome_plugin.EducationResource`
        dicts.
    """
    if cache_path is None:
        cache_path = Path(__file__).resolve().parent / "oapen_python_books.json"

    if not cache_path.exists():
        items = asyncio.run(fetch_books(query=query, limit=limit))
        cache_path.write_text(
            json.dumps([item.model_dump() for item in items], indent=2) + "\n"
        )

    items = json.loads(cache_path.read_text())
    return [card.model_dump() for card in bulk_translate(items)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent

    print("=== OAPEN Library — Python books ===")
    results = bulk_import(
        query="python programming",
        limit=50,
        cache_path=here / "oapen_python_books.json",
    )
    print(f"Found {len(results)} books")
    for card in results:
        print(f"  {card['title']!r}  ({card['spdx_license_expression']})")
