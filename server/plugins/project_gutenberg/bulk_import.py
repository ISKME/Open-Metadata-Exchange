#!/usr/bin/env -S uv run --script
#
# Source: https://gutendex.com/books/?search=Sherlock+Holmes
# Docs: https://gutendex.com/
#
# Uses the Gutendex public REST/JSON API to fetch Project Gutenberg book
# metadata.  Gutendex (https://gutendex.com/) is a community-maintained
# JSON API that exposes the full Project Gutenberg catalogue — no
# web-scraping required.
#
# Sample query (Sherlock Holmes books):
#   GET https://gutendex.com/books/?search=Sherlock+Holmes
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

from server.plugins.ome_plugin import EducationResource
from server.plugins.project_gutenberg.gutenberg_models import (
    GutenbergBook,
    GutenbergSearchResponse,
)
from server.plugins.project_gutenberg.plugin import ProjectGutenbergPlugin

GUTENDEX_BOOKS_URL = "https://gutendex.com/books/"
DEFAULT_SEARCH_QUERY = "Sherlock Holmes"
DEFAULT_LIMIT = 32
API_TIMEOUT_SECONDS = 30.0

logger = logging.getLogger(__name__)

plugin = ProjectGutenbergPlugin()


async def fetch_books(
    query: str = DEFAULT_SEARCH_QUERY,
    limit: int = DEFAULT_LIMIT,
) -> list[GutenbergBook]:
    """
    Fetch books from the Gutendex REST API matching *query*.

    Gutendex paginates in pages of 32 books.  This function fetches pages
    until *limit* books have been collected or no more pages are available.

    Args:
        query: Search query string (e.g. ``"Sherlock Holmes"``).
        limit: Maximum total number of books to return.

    Returns:
        A list of :class:`GutenbergBook` records.

    Raises:
        RuntimeError: If an API request fails.
    """
    books: list[GutenbergBook] = []
    url: str | None = GUTENDEX_BOOKS_URL
    params: dict[str, str | int] = {"search": query}

    async with httpx.AsyncClient(
        follow_redirects=True, timeout=API_TIMEOUT_SECONDS
    ) as httpx_async_client:
        while url and len(books) < limit:
            try:
                response = await httpx_async_client.get(url, params=params)
                response.raise_for_status()
            except httpx.HTTPError as exc:
                status_code = (
                    exc.response.status_code
                    if isinstance(exc, httpx.HTTPStatusError)
                    else "N/A"
                )
                msg = (
                    f"Failed to fetch books from Gutendex API: "
                    f"{url} (Status: {status_code}). {exc!s}"
                )
                raise RuntimeError(msg) from exc

            page = GutenbergSearchResponse.model_validate(response.json())
            books.extend(page.results)
            # Subsequent pages use the full "next" URL; no extra params needed.
            url = page.next
            params = {}

    return books[:limit]


def bulk_translate(books: list[dict]) -> Iterator[EducationResource]:
    """Translate a list of raw Gutendex book dicts to OME EducationResource cards."""
    yield from (plugin.make_metadata_card_from_dict(book) for book in books)


def bulk_import(
    query: str = DEFAULT_SEARCH_QUERY,
    limit: int = DEFAULT_LIMIT,
    cache_path: Path | None = None,
) -> list[dict]:
    """
    Fetch Project Gutenberg books by search query and cache results locally.

    On the first run the function calls the Gutendex REST API and writes the
    results to *cache_path*.  Subsequent calls read from the cache so that
    the network is not hit again.

    Args:
        query: Search query passed to the Gutendex REST API.
        limit: Maximum number of books to fetch from the API.
        cache_path: Path for the local JSON cache.  Defaults to
            ``gutenberg_sherlock_holmes.json`` next to this file.

    Returns:
        A list of serialised :class:`~server.plugins.ome_plugin.EducationResource`
        dicts.
    """
    if cache_path is None:
        cache_path = Path(__file__).resolve().parent / "gutenberg_sherlock_holmes.json"

    if not cache_path.exists():
        books = asyncio.run(fetch_books(query=query, limit=limit))
        cache_path.write_text(
            json.dumps([book.model_dump() for book in books], indent=2) + "\n"
        )

    books = json.loads(cache_path.read_text())
    return [card.model_dump() for card in bulk_translate(books)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent

    print(f"=== Project Gutenberg — {DEFAULT_SEARCH_QUERY!r} books ===")
    results = bulk_import(
        query=DEFAULT_SEARCH_QUERY,
        limit=DEFAULT_LIMIT,
        cache_path=here / "gutenberg_sherlock_holmes.json",
    )
    print(f"Found {len(results)} books")
    for card in results:
        print(f"  {card['title']!r}  by {card['authors']}")
