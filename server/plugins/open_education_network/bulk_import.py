#!/usr/bin/env -S uv run --script
#
# Source: https://open.umn.edu/opentextbooks/textbooks.json
# Docs: https://open.umn.edu/opentextbooks/api-docs/index.html
#
# Uses the Open Education Network public REST/JSON API to fetch textbook metadata.
# Supports filtering by subject and format (eBook, PDF, etc.).
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
from server.plugins.open_education_network.open_education_network_models import (
    OENTextbook,
    OENTextbookList,
)
from server.plugins.open_education_network.plugin import OpenEducationNetworkPlugin

OEN_BASE_URL = "https://open.umn.edu/opentextbooks"
OEN_TEXTBOOKS_API_URL = f"{OEN_BASE_URL}/textbooks.json"

logger = logging.getLogger(__name__)

plugin = OpenEducationNetworkPlugin()


def _parse_records(items: list) -> list[OENTextbook]:
    """
    Validate raw API items into OENTextbook records.

    Uses a Python 3.13+ ExceptionGroup to gather and report all validation
    errors at once rather than stopping at the first malformed record.
    Valid records are returned even when some items fail validation.
    """
    books: list[OENTextbook] = []
    errors: list[ValidationError] = []
    for item in items:
        try:
            books.append(OENTextbook.model_validate(item))
        except ValidationError as exc:
            errors.append(exc)
    if errors:
        msg = f"Skipping {len(errors)} of {len(items)} malformed OEN textbook record(s)"
        try:
            raise ExceptionGroup(msg, errors)
        except* ValidationError as eg:
            for exc in eg.exceptions:
                logger.warning("Malformed textbook record: %s", exc)
    return books


def fetch_textbooks(
    *,
    subject: str = "",
    formats: list[str] | None = None,
) -> list[OENTextbook]:
    """
    Fetch textbooks from the Open Education Network API.

    Args:
        subject: Subject keyword to search for (e.g., ``"Python"``).
        formats: List of format names to filter by (e.g., ``["eBook", "PDF"]``).
                 Passed to the API as repeated ``format[]`` query parameters.

    Returns:
        A list of :class:`OENTextbook` records.
    """
    params: dict[str, str | list[str]] = {}
    if subject:
        params["subject"] = subject
    if formats:
        params["format[]"] = formats

    try:
        with httpx.Client(follow_redirects=True, timeout=30.0) as httpx_client:
            response = httpx_client.get(OEN_TEXTBOOKS_API_URL, params=params)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        status_code = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError)
            else "N/A"
        )
        msg = (
            f"Failed to fetch textbooks from Open Education Network API: "
            f"{OEN_TEXTBOOKS_API_URL} (Status: {status_code}). {exc!s}"
        )
        raise RuntimeError(msg) from exc

    return _parse_records(response.json())


def bulk_translate(books: list[dict]) -> Iterator[EducationResource]:
    """Translate a list of raw OEN textbook dicts to OME EducationResource cards."""
    yield from (plugin.make_metadata_card_from_dict(book) for book in books)


def bulk_import(
    subject: str = "Python",
    formats: list[str] | None = None,
    cache_path: Path | None = None,
) -> list[dict]:
    """
    Fetch Open Education Network textbooks and return serialised OME records.

    Results are cached locally so that repeated runs do not re-fetch the API.

    Args:
        subject: Subject keyword to filter by (default: ``"Python"``).
        formats: Format names to filter by (default: ``["eBook", "PDF"]``).
        cache_path: Path to the local JSON cache file. If ``None``, a default
                    path next to this module is used.

    Returns:
        A list of serialised :class:`EducationResource` dicts.
    """
    if formats is None:
        formats = ["eBook", "PDF"]
    if cache_path is None:
        cache_path = (
            Path(__file__).resolve().parent / "open_education_network_python_books.json"
        )

    if not cache_path.exists():
        books = fetch_textbooks(subject=subject, formats=formats)
        cache_path.write_text(
            json.dumps([book.model_dump() for book in books], indent=2) + "\n"
        )

    raw = json.loads(cache_path.read_text())
    books_list = OENTextbookList.model_validate(raw)
    book_dicts = [b.model_dump() for b in books_list.root]
    return [card.model_dump() for card in bulk_translate(book_dicts)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent

    print("=== Open Education Network — Python eBook/PDF results ===")
    results = bulk_import(
        subject="Python",
        formats=["eBook", "PDF"],
        cache_path=here / "open_education_network_python_books.json",
    )
    print(f"Found {len(results)} textbooks")
    for card in results:
        print(f"  {card['title']!r}  ({card['spdx_license_expression']})")
