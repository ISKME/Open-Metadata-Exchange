#!/usr/bin/env -S uv run --script

# Source: https://oercommons.org/api/v1/materials/search
# Docs: https://oercommons.org/api/v1/docs

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
#     "pydantic",
# ]
# ///

"""
Bulk-import metadata from OER Commons.

Uses the OER Commons search API to fetch Open Educational Resources and
translate them into standardised OME ``EducationResource`` cards.
Results are cached locally to avoid repeated API calls.
"""

import json
import logging
from collections.abc import Iterator
from pathlib import Path

import httpx
from pydantic import ValidationError

from server.plugins.oercommons.oercommons_models import FieldSource
from server.plugins.ome_plugin import EducationResource

OERCOMMONS_SEARCH_URL = "https://oercommons.org/api/v1/materials/search"
DEFAULT_SEARCH_QUERY = "python"
DEFAULT_BATCH_SIZE = 20

logger = logging.getLogger(__name__)


def _parse_items(raw_hits: list) -> list[FieldSource]:
    """
    Validate raw search-hit dicts into :class:`FieldSource` records.

    Uses a Python 3.13+ ExceptionGroup to collect all validation errors
    and report them together while returning valid records to the caller.
    """
    items: list[FieldSource] = []
    errors: list[ValidationError] = []
    for hit in raw_hits:
        source = hit.get("_source", hit)
        try:
            items.append(FieldSource.model_validate(source))
        except ValidationError as exc:
            errors.append(exc)
    if errors:
        msg = f"Skipping {len(errors)} malformed OER Commons record(s)"
        try:
            raise ExceptionGroup(msg, errors)
        except* ValidationError as eg:
            for exc in eg.exceptions:
                logger.warning("Malformed OER Commons record: %s", exc)
    return items


def fetch_materials(
    query: str = DEFAULT_SEARCH_QUERY,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> list[FieldSource]:
    """
    Search OER Commons and return a list of :class:`FieldSource` records.

    Args:
        query: Search query string.
        batch_size: Maximum number of results to return.

    Returns:
        A list of :class:`FieldSource` records.
    """
    params = {"q": query, "batch_size": batch_size}
    try:
        with httpx.Client(follow_redirects=True, timeout=30.0) as httpx_client:
            response = httpx_client.get(
                OERCOMMONS_SEARCH_URL, params=params
            ).raise_for_status()
    except httpx.HTTPError as exc:
        status_code = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError)
            else "N/A"
        )
        msg = (
            f"Failed to fetch OER Commons materials: {OERCOMMONS_SEARCH_URL} "
            f"(Status: {status_code}). {exc!s}"
        )
        raise RuntimeError(msg) from exc

    payload = response.json()
    hits = payload.get("hits", {}).get("hits", []) if isinstance(payload, dict) else []
    return _parse_items(hits)


def bulk_translate(items: list[dict]) -> Iterator[EducationResource]:
    """Translate a list of raw OER Commons ``_source`` dicts to OME cards."""
    for item in items:
        try:
            source = FieldSource.model_validate(item)
            yield EducationResource(
                title=source.title,
                description=source.text,
                authors=source.authors,
                authoring_institution=source.provider_name,
                subject_tags=source.keywords_names,
                creation_date=source.published_on,
                last_modified_date=source.modified_timestamp,
            )
        except (ValidationError, AttributeError) as exc:
            logger.warning("Skipping malformed OER Commons item: %s", exc)


def bulk_import(
    query: str = DEFAULT_SEARCH_QUERY,
    batch_size: int = DEFAULT_BATCH_SIZE,
    cache_path: Path | None = None,
) -> list[dict]:
    """
    Fetch OER Commons materials and return serialised OME records.

    Results are cached locally so that repeated runs do not re-fetch the API.

    Args:
        query: Search query string (default: ``"python"``).
        batch_size: Maximum number of results to return (default: 20).
        cache_path: Path to the local JSON cache file.  If ``None``, defaults
                    to ``oercommons_python_materials.json`` next to this module.

    Returns:
        A list of serialised :class:`EducationResource` dicts.
    """
    if cache_path is None:
        cache_path = (
            Path(__file__).resolve().parent / "oercommons_python_materials.json"
        )

    if not cache_path.exists():
        items = fetch_materials(query=query, batch_size=batch_size)
        cache_path.write_text(
            json.dumps([item.model_dump() for item in items], indent=2) + "\n"
        )

    raw = json.loads(cache_path.read_text())
    return [card.model_dump() for card in bulk_translate(raw)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent

    print(f"=== OER Commons — {DEFAULT_SEARCH_QUERY!r} search results ===")
    results = bulk_import(
        query=DEFAULT_SEARCH_QUERY,
        cache_path=here / "oercommons_python_materials.json",
    )
    print(f"Found {len(results)} materials")
    for card in results:
        print(f"  {card['title']!r}  ({card['spdx_license_expression']})")
