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

from server.plugins.oercommons.plugin import OERCommonsPlugin
from server.plugins.ome_plugin import EducationResource

OERCOMMONS_SEARCH_URL = "https://oercommons.org/api/v1/materials/search"
DEFAULT_SEARCH_QUERY = "python"
DEFAULT_BATCH_SIZE = 20

logger = logging.getLogger(__name__)

_plugin = OERCommonsPlugin()


def fetch_materials(
    query: str = DEFAULT_SEARCH_QUERY,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> list[dict]:
    """
    Search OER Commons and return raw search-hit dicts.

    Each returned dict has the same shape as :class:`Model` (i.e. it contains
    ``_index``, ``_type``, ``_id``, ``_score``, ``_source``) so that it can be
    passed directly to :meth:`OERCommonsPlugin.make_metadata_card_from_json`.

    Args:
        query: Search query string.
        batch_size: Maximum number of results to return.

    Returns:
        A list of raw search-hit dicts.
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
    return payload.get("hits", {}).get("hits", []) if isinstance(payload, dict) else []


def bulk_translate(hits: list[dict]) -> Iterator[EducationResource]:
    """Translate raw OER Commons search-hit dicts to OME EducationResource cards.

    Each dict should have the same shape as :class:`Model` (``_index``,
    ``_type``, ``_id``, ``_score``, ``_source``), matching the format returned
    by the search API and cached by :func:`bulk_import`.
    """
    for hit in hits:
        try:
            yield _plugin.make_metadata_card_from_json(json.dumps(hit))
        except (ValidationError, ValueError, AttributeError) as exc:
            logger.warning("Skipping malformed OER Commons hit: %s", exc)


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
        hits = fetch_materials(query=query, batch_size=batch_size)
        cache_path.write_text(json.dumps(hits, indent=2) + "\n")

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
