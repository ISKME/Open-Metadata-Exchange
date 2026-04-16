#!/usr/bin/env -S uv run --script
#
# Source: https://pressbooks.directory/wp-json/pressbooks/v2/books
#
# Uses the Pressbooks Directory public REST/JSON API to fetch book metadata.
# No web scraping is required — the API returns structured JSON directly.
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
#     "pydantic",
# ]
# ///

import json
import logging
from collections.abc import Iterator
from pathlib import Path

import httpx
from pydantic import ValidationError

from server.plugins.ome_plugin import EducationResource
from server.plugins.pressbooks.plugin import PressbooksPlugin
from server.plugins.pressbooks.pressbooks_models import PressbooksBook

PRESSBOOKS_DIRECTORY_URL = "https://pressbooks.directory"
BOOKS_API_URL = f"{PRESSBOOKS_DIRECTORY_URL}/wp-json/pressbooks/v2/books"
DEFAULT_PER_PAGE = 100

logger = logging.getLogger(__name__)

plugin = PressbooksPlugin()


def fetch_books(
    *,
    search: str = "",
    institution: str = "",
    per_page: int = DEFAULT_PER_PAGE,
    page: int = 1,
) -> list[PressbooksBook]:
    """
    Fetch a page of books from the Pressbooks Directory REST API.

    Args:
        search: Full-text search query (maps to the ``?q=`` UI parameter).
        institution: Institution name filter (maps to the ``?inst=`` UI parameter).
                     Multiple institutions can be joined with ``&&``
                     (e.g. ``"University at Buffalo&&University of Rochester"``).
        per_page: Number of results per page (max 100).
        page: 1-based page number.

    Returns:
        A list of :class:`PressbooksBook` records parsed from the API response.
    """
    params: dict[str, str | int] = {"per_page": per_page, "page": page}
    if search:
        params["search"] = search
    if institution:
        params["institution"] = institution

    with httpx.Client(follow_redirects=True, timeout=30.0) as client:
        try:
            response = client.get(BOOKS_API_URL, params=params)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            status_code = (
                exc.response.status_code
                if isinstance(exc, httpx.HTTPStatusError)
                else "N/A"
            )
            msg = (
                f"Failed to fetch books from Pressbooks Directory API: {BOOKS_API_URL} "
                f"(Status: {status_code}). {exc!s}"
            )
            raise RuntimeError(msg) from exc

    books: list[PressbooksBook] = []
    for item in response.json():
        try:
            books.append(PressbooksBook.model_validate(item))
        except ValidationError:
            item_id = item.get("id") if isinstance(item, dict) else repr(item)
            logger.warning("Skipping malformed book record: %r", item_id)
    return books


def fetch_all_books(
    *,
    search: str = "",
    institution: str = "",
    per_page: int = DEFAULT_PER_PAGE,
) -> list[PressbooksBook]:
    """
    Fetch all matching books from the Pressbooks Directory, handling pagination.

    Args:
        search: Full-text search query.
        institution: Institution name filter.
        per_page: Number of results per page.

    Returns:
        A flat list of all :class:`PressbooksBook` records across all pages.
    """
    all_books: list[PressbooksBook] = []
    page = 1
    while True:
        books = fetch_books(
            search=search, institution=institution, per_page=per_page, page=page
        )
        all_books.extend(books)
        if len(books) < per_page:
            break
        page += 1
    return all_books


def bulk_translate(books: list[dict]) -> Iterator[EducationResource]:
    """Translate a list of raw Pressbooks book dicts to OME EducationResource cards."""
    yield from (plugin.make_metadata_card_from_dict(book) for book in books)


def bulk_import_search(
    search: str,
    cache_path: Path,
) -> list[dict]:
    """
    Fetch Pressbooks books by search query and cache results locally.

    Args:
        search: Search term to pass to the API.
        cache_path: Path to the local JSON cache file.

    Returns:
        A list of serialised EducationResource dicts.
    """
    if not cache_path.exists():
        books = fetch_all_books(search=search)
        cache_path.write_text(
            json.dumps([book.model_dump() for book in books], indent=2) + "\n"
        )

    books = json.loads(cache_path.read_text())
    return [card.model_dump() for card in bulk_translate(books)]


def bulk_import_institution(
    institution: str,
    cache_path: Path,
) -> list[dict]:
    """
    Fetch Pressbooks books by institution filter and cache results locally.

    Args:
        institution: Institution name(s) joined with ``&&``.
        cache_path: Path to the local JSON cache file.

    Returns:
        A list of serialised EducationResource dicts.
    """
    if not cache_path.exists():
        books = fetch_all_books(institution=institution)
        cache_path.write_text(
            json.dumps([book.model_dump() for book in books], indent=2) + "\n"
        )

    books = json.loads(cache_path.read_text())
    return [card.model_dump() for card in bulk_translate(books)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent

    print("=== Python search results ===")
    python_results = bulk_import_search(
        search="python",
        cache_path=here / "pressbooks_python_books.json",
    )
    print(f"Found {len(python_results)} books")
    for card in python_results:
        print(f"  {card['title']!r}  ({card['spdx_license_expression']})")

    print("\n=== University at Buffalo / Rochester institution results ===")
    institution = (
        "University at Buffalo"
        "&&University of Rochester"
        "&&Rochester Community and Technical College"
    )
    uni_results = bulk_import_institution(
        institution=institution,
        cache_path=here / "pressbooks_university_books.json",
    )
    print(f"Found {len(uni_results)} books")
    for card in uni_results:
        print(f"  {card['title']!r}  ({card['authoring_institution']})")
