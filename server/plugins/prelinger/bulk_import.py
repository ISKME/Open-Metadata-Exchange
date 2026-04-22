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
Bulk-import Prelinger Archives video metadata from the Internet Archive.

This module re-exports the :func:`bulk_import` function defined in
``fetch_prelinger_videos.py`` so that the plugin conforms to the standard
OME ``bulk_import.py`` interface.
"""

from server.plugins.prelinger.fetch_prelinger_videos import (
    bulk_import,
    fetch_item_metadata,
    search_prelinger,
)

__all__ = ["bulk_import", "fetch_item_metadata", "search_prelinger"]

if __name__ == "__main__":
    from server.plugins.prelinger.plugin import PrelingerPlugin

    plugin = PrelingerPlugin()
    records = bulk_import()
    print(f"Fetched {len(records)} records\n")
    for i, record in enumerate(records, start=1):
        print(f"{i:>2}. {record.title!r}")
        print(f"    identifier: {record.identifier}")
        print(f"    creator:    {record.creator}")
        print(f"    date:       {record.date}")
        print(f"    licenseurl: {record.licenseurl!r}")
        print()

    print("\n--- EducationResource cards ---\n")
    for record in records:
        card = plugin.make_metadata_card_from_dict(record.model_dump())
        print(f"  title:      {card.title!r}")
        print(f"  source_url: {card.source_url!r}")
        print(f"  license:    {card.spdx_license_expression!r}")
        print()
