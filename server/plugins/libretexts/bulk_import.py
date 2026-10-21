#!/usr/bin/env -S uv run --script
#
# Source: https://commons.libretexts.org/api/v1/commons/catalog
#
# Uses the LibreTexts Commons public REST/JSON catalog API to fetch book metadata.
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx2",
#     "pydantic",
# ]
# ///

import asyncio
import json
import logging
from collections.abc import Iterator
from pathlib import Path

import httpx2
from pydantic import ValidationError

from server.plugins.libretexts.libretexts_models import (
    LibreTextsBook,
    LibreTextsBookList,
)
from server.plugins.libretexts.plugin import LibreTextsPlugin
from server.plugins.ome_plugin import EducationResource

CATALOG_API_URL = "https://commons.libretexts.org/api/v1/commons/catalog"

logger = logging.getLogger(__name__)

plugin = LibreTextsPlugin()


def _parse_records(items: list) -> list[LibreTextsBook]:
    """Validate raw API items, logging all malformed records together."""
    books: list[LibreTextsBook] = []
    errors: list[ValidationError] = []
    for item in items:
        try:
            books.append(LibreTextsBook.model_validate(item))
        except ValidationError as exc:
            errors.append(exc)
    if errors:
        msg = f"Skipping {len(errors)} of {len(items)} malformed LibreTexts record(s)"
        try:
            raise ExceptionGroup(msg, errors)
        except* ValidationError as eg:
            for exc in eg.exceptions:
                logger.warning("Malformed book record: %s", exc)
    return books


async def fetch_books(search: str = "Python", limit: int = 100) -> list[LibreTextsBook]:
    """Fetch books matching ``search`` from the LibreTexts Commons catalog API."""
    params = {"searchQuery": search, "limit": limit}
    async with httpx2.AsyncClient(
        follow_redirects=True, timeout=30.0
    ) as httpx_async_client:
        payload = (
            (await httpx_async_client.get(CATALOG_API_URL, params=params))
            .raise_for_status()
            .json()
        )
    data = payload.get("data", payload) if isinstance(payload, dict) else payload
    items = data.get("books", []) if isinstance(data, dict) else data
    return _parse_records(items)


def bulk_translate(books: list[dict]) -> Iterator[EducationResource]:
    """Translate raw LibreTexts book dicts to OME EducationResource cards."""
    yield from (plugin.make_metadata_card_from_dict(book) for book in books)


def bulk_import(search: str = "Python", cache_path: Path | None = None) -> list[dict]:
    """
    Fetch LibreTexts books and return serialised OME records.

    Results are cached locally so that repeated runs do not re-fetch the API.
    """
    if cache_path is None:
        cache_path = Path(__file__).resolve().parent / "libretexts_python_books.json"
    if not cache_path.exists():
        books = asyncio.run(fetch_books(search))
        cache_path.write_text(
            json.dumps([b.model_dump(by_alias=True) for b in books], indent=2) + "\n"
        )
    books_list = LibreTextsBookList.model_validate_json(cache_path.read_text())
    book_dicts = [b.model_dump(by_alias=True) for b in books_list.root]
    return [card.model_dump() for card in bulk_translate(book_dicts)]


if __name__ == "__main__":
    print("=== LibreTexts Commons — 'Python' books ===")
    results = bulk_import()
    print(f"Found {len(results)} books")
    for card in results:
        print(f"  {card['title']!r}  ({card['spdx_license_expression']})")
