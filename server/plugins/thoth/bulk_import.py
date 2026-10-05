#!/usr/bin/env -S uv run --script
#
# Fetch open-access book metadata from Thoth Open Metadata using thothlibrary.
#
# Thoth GraphQL API: https://api.thoth.pub
# thothlibrary PyPI: https://pypi.org/project/thothlibrary
#
# Sample query (Python books):
#   ThothClient().books(search="Python", limit=50)
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
#     "thothlibrary",
# ]
# ///

import json
import logging
from collections.abc import Iterator
from pathlib import Path

from thothlibrary import ThothClient

from server.plugins.ome_plugin import EducationResource
from server.plugins.thoth.plugin import ThothPlugin
from server.plugins.thoth.thoth_models import ThothBook

DEFAULT_LIMIT = 50
THOTH_ENDPOINT = "https://api.thoth.pub"

logger = logging.getLogger(__name__)

plugin = ThothPlugin()


def fetch_books(
    query: str = "Python",
    limit: int = DEFAULT_LIMIT,
    offset: int = 0,
) -> list[ThothBook]:
    """
    Fetch open-access books from the Thoth GraphQL API.

    Uses ``thothlibrary.ThothClient`` to query the ``books`` endpoint with the
    given search term.  The Munch objects returned by the client are converted
    to :class:`ThothBook` Pydantic models for type-safe downstream processing.

    Args:
        query:  Search term passed to the Thoth ``books`` endpoint filter.
        limit:  Maximum number of results to return (default 50).
        offset: Pagination offset (default 0).

    Returns:
        A list of :class:`ThothBook` records.

    Raises:
        RuntimeError: If the Thoth API request fails.
    """
    thoth_graphql_client = ThothClient(thoth_endpoint=THOTH_ENDPOINT)
    try:
        raw_books = thoth_graphql_client.books(search=query, limit=limit, offset=offset)
    except Exception as exc:
        msg = f"Failed to fetch books from Thoth API ({THOTH_ENDPOINT}): {exc!s}"
        raise RuntimeError(msg) from exc

    books: list[ThothBook] = []
    for raw_book in raw_books:
        book_dict = raw_book.toDict()
        try:
            books.append(ThothBook.model_validate(book_dict))
        except Exception:
            logger.exception("Could not parse Thoth book: %s", book_dict.get("workId"))
    return books


def bulk_translate(items: list[dict]) -> Iterator[EducationResource]:
    """Translate a list of raw Thoth book dicts to OME EducationResource cards."""
    yield from (plugin.make_metadata_card_from_dict(item) for item in items)


def bulk_import(
    query: str = "Python",
    limit: int = DEFAULT_LIMIT,
    cache_path: Path | None = None,
) -> list[dict]:
    """
    Fetch Thoth books by search query and cache results locally.

    On the first run the function calls the Thoth GraphQL API and writes the
    raw book records to *cache_path*.  Subsequent calls read from the cache so
    that the network is not hit again.

    Args:
        query:      Search term passed to the Thoth ``books`` endpoint.
        limit:      Maximum number of results to fetch from the API.
        cache_path: Path for the local JSON cache.  Defaults to
                    ``thoth_python_books.json`` next to this file.

    Returns:
        A list of serialised :class:`~server.plugins.ome_plugin.EducationResource`
        dicts.
    """
    if cache_path is None:
        cache_path = Path(__file__).resolve().parent / "thoth_python_books.json"

    if not cache_path.exists():
        books = fetch_books(query=query, limit=limit)
        cache_path.write_text(
            json.dumps([book.model_dump() for book in books], indent=2) + "\n"
        )

    items = json.loads(cache_path.read_text())
    return [card.model_dump() for card in bulk_translate(items)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent

    print("=== Thoth Open Metadata — Python books ===")
    results = bulk_import(
        query="Python",
        limit=50,
        cache_path=here / "thoth_python_books.json",
    )
    print(f"Found {len(results)} books")
    for card in results:
        print(f"  {card['title']!r}  ({card['source_url']})")
