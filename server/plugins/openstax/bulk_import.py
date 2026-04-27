#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "beautifulsoup4",
#     "httpx",
#     "pydantic",
# ]
# ///

import asyncio
import json
import logging
from collections.abc import Iterator
from pathlib import Path
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from server.plugins.ome_plugin import EducationResource
from server.plugins.openstax.openstax_models import OpenStaxBook
from server.plugins.openstax.plugin import OpenStaxPlugin

OPENSTAX_BASE_URL = "https://openstax.org"
COMPUTER_SCIENCE_SUBJECT_URL = "https://openstax.org/subjects/computer-science"
logger = logging.getLogger(__name__)


def _authors_from_value(value: object) -> list[str]:
    """
    Normalize JSON-LD author values (str, dict, or list) to a flat list of names.
    """
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        name = value.get("name")
        return [name.strip()] if isinstance(name, str) and name.strip() else []
    if isinstance(value, list):
        names = []
        for author in value:
            names.extend(_authors_from_value(author))
        return names
    if value is not None:
        logger.warning("Unsupported author field type: %s", type(value).__name__)
    return []


def _extract_json_ld_books(payload: object) -> Iterator[OpenStaxBook]:
    """
    Recursively traverse JSON-LD payloads and yield OpenStaxBook records.
    """
    if isinstance(payload, list):
        for item in payload:
            yield from _extract_json_ld_books(item)
        return

    if not isinstance(payload, dict):
        return

    item_list = payload.get("itemListElement")
    if isinstance(item_list, list):
        for item in item_list:
            target = item.get("item", item) if isinstance(item, dict) else item
            yield from _extract_json_ld_books(target)

    raw_type = payload.get("@type")
    types = raw_type if isinstance(raw_type, list) else [raw_type]
    if any(item in {"Book", "CreativeWork"} for item in types):
        title = payload.get("name") or payload.get("headline") or payload.get("title")
        if isinstance(title, str) and title:
            raw_url = payload.get("url")
            source_url = (
                urljoin(OPENSTAX_BASE_URL, raw_url) if isinstance(raw_url, str) else ""
            )
            yield OpenStaxBook(
                title=title.strip(),
                description=str(payload.get("description") or "").strip(),
                authors=_authors_from_value(payload.get("author")),
                subject_tags=["computer science"],
                source_url=source_url,
            )

    for value in payload.values():
        if isinstance(value, list | dict):
            yield from _extract_json_ld_books(value)


def extract_books_from_subject_page(html: str) -> list[OpenStaxBook]:
    """
    Extract books from a subject page using embedded JSON-LD metadata first, then HTML.
    """
    soup = BeautifulSoup(html, "html.parser")
    books_by_key: dict[str, OpenStaxBook] = {}

    for script in soup.select('script[type="application/ld+json"]'):
        script_text = script.string
        if not script_text:
            continue
        try:
            json_payload = json.loads(script_text)
        except json.JSONDecodeError as exc:
            logger.debug("Skipping invalid JSON-LD script: %s", exc)
            continue
        for book in _extract_json_ld_books(json_payload):
            key = book.source_url or book.title
            books_by_key.setdefault(key, book)

    if not books_by_key:
        for anchor in soup.select('a[href*="/details/books/"]'):
            href = anchor.get("href")
            title = " ".join(anchor.stripped_strings)
            if not href or not title:
                continue
            source_url = urljoin(OPENSTAX_BASE_URL, href)
            key = source_url or title
            books_by_key.setdefault(
                key,
                OpenStaxBook(
                    title=title,
                    subject_tags=["computer science"],
                    source_url=source_url,
                ),
            )

    return sorted(books_by_key.values(), key=lambda book: book.title.lower())


async def fetch_subject_page(url: str = COMPUTER_SCIENCE_SUBJECT_URL) -> str:
    """
    Fetch OpenStax subject page HTML.
    """
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=30.0
    ) as httpx_async_client:
        try:
            return (await httpx_async_client.get(url)).raise_for_status().text
        except httpx.HTTPError as exc:
            status_code = (
                exc.response.status_code
                if isinstance(exc, httpx.HTTPStatusError)
                else "N/A"
            )
            msg = (
                f"Failed to fetch OpenStax subject page: {url} "
                f"(Status: {status_code}). {exc!s}"
            )
            raise RuntimeError(msg) from exc


def bulk_translate(books: list[dict]) -> Iterator[EducationResource]:
    plugin = OpenStaxPlugin()
    yield from (plugin.make_metadata_card_from_dict(book) for book in books)


def bulk_import(url: str = COMPUTER_SCIENCE_SUBJECT_URL) -> list[dict]:
    """
    Gather OpenStax Computer Science books and return serialized OME records.
    """
    here = Path(__file__).resolve().parent
    html_path = here / "openstax_computer_science_subject.html"
    if not html_path.exists():
        html_path.write_text(asyncio.run(fetch_subject_page(url)))

    books_path = here / "openstax_computer_science_books.json"
    if not books_path.exists():
        books = extract_books_from_subject_page(html_path.read_text())
        books_path.write_text(
            f"{json.dumps([book.model_dump() for book in books], indent=2)}\n"
        )

    books = json.loads(books_path.read_text())
    return [card.model_dump() for card in bulk_translate(books)]


if __name__ == "__main__":
    print(json.dumps(bulk_import(), indent=2))
