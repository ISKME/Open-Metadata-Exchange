#!/usr/bin/env -S uv run --script

# Source: https://openlibrary.org/search.json
# Docs: https://openlibrary.org/dev/docs/api

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
#     "pydantic",
# ]
# ///

"""
Bulk-import book metadata from the Open Library search API.

Open Library exposes a free public search API that returns structured JSON.
This module fetches books matching a search query and translates them into
standardised OME ``EducationResource`` cards.
"""

import json
import logging
from collections.abc import Iterator
from pathlib import Path

import httpx

from server.plugins.ome_plugin import EducationResource
from server.plugins.openlibrary.plugin import OpenLibraryPlugin

OPENLIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPENLIBRARY_BASE_URL = "https://openlibrary.org"
DEFAULT_SEARCH_QUERY = "python programming"
DEFAULT_LIMIT = 20

logger = logging.getLogger(__name__)

plugin = OpenLibraryPlugin()


def fetch_books(
    query: str = DEFAULT_SEARCH_QUERY,
    limit: int = DEFAULT_LIMIT,
) -> list[dict]:
    """
    Search Open Library and return a list of raw book dicts.

    Args:
        query: Search query string.
        limit: Maximum number of results to return.

    Returns:
        A list of raw book dicts from the Open Library search API.
    """
    params = {"q": query, "limit": limit}
    try:
        with httpx.Client(follow_redirects=True, timeout=30.0) as httpx_client:
            response = httpx_client.get(
                OPENLIBRARY_SEARCH_URL, params=params
            ).raise_for_status()
    except httpx.HTTPError as exc:
        status_code = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError)
            else "N/A"
        )
        msg = (
            f"Failed to fetch books from Open Library search API: "
            f"{OPENLIBRARY_SEARCH_URL} (Status: {status_code}). {exc!s}"
        )
        raise RuntimeError(msg) from exc

    payload = response.json()
    return payload.get("docs", []) if isinstance(payload, dict) else []


def bulk_translate(books: list[dict]) -> Iterator[EducationResource]:
    """Translate raw Open Library search result dicts to OME EducationResource cards."""
    for book in books:
        title = book.get("title", "")
        if not title:
            continue
        authors = book.get("author_name", [])
        subjects = book.get("subject", [])
        key = book.get("key", "")
        source_url = f"{OPENLIBRARY_BASE_URL}{key}" if key else ""
        yield EducationResource(
            title=title,
            description="",
            authors=authors,
            authoring_institution="Open Library (https://openlibrary.org)",
            subject_tags=subjects,
            source_url=source_url,
            version_url=source_url,
        )


def bulk_import(
    query: str = DEFAULT_SEARCH_QUERY,
    limit: int = DEFAULT_LIMIT,
    cache_path: Path | None = None,
) -> list[dict]:
    """
    Fetch Open Library books and return serialised OME records.

    Results are cached locally so that repeated runs do not re-fetch the API.

    Args:
        query: Search query string (default: ``"python programming"``).
        limit: Maximum number of results (default: 20).
        cache_path: Path to the local JSON cache file.  If ``None``, defaults
                    to ``openlibrary_python_books.json`` next to this module.

    Returns:
        A list of serialised :class:`EducationResource` dicts.
    """
    if cache_path is None:
        cache_path = Path(__file__).resolve().parent / "openlibrary_python_books.json"

    if not cache_path.exists():
        books = fetch_books(query=query, limit=limit)
        cache_path.write_text(json.dumps(books, indent=2) + "\n")

    raw = json.loads(cache_path.read_text())
    return [card.model_dump() for card in bulk_translate(raw)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent

    print(f"=== Open Library — {DEFAULT_SEARCH_QUERY!r} search results ===")
    results = bulk_import(
        query=DEFAULT_SEARCH_QUERY,
        cache_path=here / "openlibrary_python_books.json",
    )
    print(f"Found {len(results)} books")
    for card in results:
        print(f"  {card['title']!r}  (authors: {card['authors'][:2]})")
