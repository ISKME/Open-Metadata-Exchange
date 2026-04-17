#!/usr/bin/env -S uv run --script

# Source: https://archive.org/details/prelinger?tab=collection&query=finland
# Docs:   https://archive.org/developers/md-read.html

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
#     "pydantic",
# ]
# ///

"""
Fetch Prelinger video metadata from the Internet Archive.

Two complementary functions are provided:

* ``search_prelinger`` – queries the Internet Archive Advanced Search API to
  discover video identifiers within the Prelinger collection.
* ``fetch_item_metadata`` – retrieves the full metadata for a single item via
  the Internet Archive Metadata (md-read) API.

Usage (run directly)::

    uv run server/plugins/prelinger/fetch_prelinger_videos.py

Results are cached in ``prelinger_finland_videos.json`` inside this directory.
"""

import json
from pathlib import Path

import httpx

from server.plugins.prelinger.prelinger_models import (
    PrelingerItem,
    PrelingerMetadataResponse,
    PrelingerModel,
    PrelingerSearchResponse,
)
from server.plugins.prelinger.plugin import PrelingerPlugin

IA_SEARCH_URL = "https://archive.org/advancedsearch.php"
IA_METADATA_URL = "https://archive.org/metadata/{identifier}"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; OME-Bot/1.0; "
        "+https://github.com/ISKME/Open-Metadata-Exchange)"
    ),
}


def search_prelinger(
    query: str,
    rows: int = 50,
    *,
    client: httpx.Client,
) -> list[str]:
    """
    Search the Prelinger collection and return a list of item identifiers.

    Uses the Internet Archive Advanced Search API:
    ``GET https://archive.org/advancedsearch.php``
    """
    params = {
        "q": f"collection:prelinger {query}",
        "fl[]": "identifier",
        "rows": rows,
        "output": "json",
    }
    response = client.get(IA_SEARCH_URL, params=params, headers=HEADERS)
    response.raise_for_status()
    search_result = PrelingerSearchResponse.model_validate_json(response.text)
    return [doc.identifier for doc in search_result.response.docs if doc.identifier]


def fetch_item_metadata(identifier: str, *, client: httpx.Client) -> PrelingerItem:
    """
    Fetch the full metadata for a single Prelinger item via the md-read API.

    ``GET https://archive.org/metadata/{identifier}``
    """
    url = IA_METADATA_URL.format(identifier=identifier)
    response = client.get(url, headers=HEADERS)
    response.raise_for_status()
    envelope = PrelingerMetadataResponse.model_validate_json(response.text)
    return envelope.metadata


def bulk_import(query: str = "finland", rows: int = 50) -> list[PrelingerItem]:
    """
    Search the Prelinger collection for *query* and return a list of
    ``PrelingerItem`` objects with full metadata.

    Results are cached in ``prelinger_finland_videos.json`` (when *query* is
    ``"finland"``).  Re-run with a fresh environment to bypass the cache.
    """
    here = Path(__file__).resolve().parent
    cache_filename = f"prelinger_{query.replace(' ', '_')}_videos.json"
    cache_path = here / cache_filename

    if cache_path.exists():
        return PrelingerModel.model_validate_json(cache_path.read_text()).root

    items: list[PrelingerItem] = []
    with httpx.Client(follow_redirects=True, timeout=30.0) as client:
        identifiers = search_prelinger(query, rows=rows, client=client)
        for identifier in identifiers:
            item = fetch_item_metadata(identifier, client=client)
            if item.mediatype == "movies":
                items.append(item)

    model = PrelingerModel(root=items)
    cache_path.write_text(model.model_dump_json(indent=2) + "\n")

    return items


if __name__ == "__main__":
    plugin = PrelingerPlugin()
    records = bulk_import()
    print(f"Fetched {len(records)} records\n")
    for i, record in enumerate(records, start=1):
        print(f"{i:>2}. {record.title!r}")
        print(f"    identifier: {record.identifier}")
        print(f"    creator:    {record.creator}")
        print(f"    subject:    {record.subject}")
        print(f"    date:       {record.date}")
        print(f"    licenseurl: {record.licenseurl!r}")
        print()

    print("\n--- EducationResource cards ---\n")
    for record in records:
        card = plugin.make_metadata_card_from_dict(record.model_dump())
        print(f"  title:      {card.title!r}")
        print(f"  source_url: {card.source_url!r}")
        print(f"  authors:    {card.authors}")
        print(f"  license:    {card.spdx_license_expression!r}")
        print()

    # Also dump a pretty-printed sample of the raw records
    here = Path(__file__).resolve().parent
    sample_path = here / "prelinger_finland_videos.json"
    sample_path.write_text(
        json.dumps([r.model_dump() for r in records], indent=2) + "\n"
    )
    print(f"Wrote {len(records)} records to {sample_path}")
