#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
#     "pydantic",
# ]
# ///

"""
Bulk import utilities for Collage Photos educational image metadata.

Fetches and caches photo resource metadata, converting each record into
a CollagePhotosItem for use by CollagePhotosPlugin.
"""

import asyncio
from pathlib import Path

import httpx

from server.plugins.collage_photos.collage_photos_models import (
    CollagePhotosItem,
    CollagePhotosModel,
)

_CACHE = Path(__file__).resolve().parent / "collage_photos_resources.json"


async def bulk_import() -> list[CollagePhotosItem]:
    """Return cached CollagePhotosItem records, loading from cache if available."""
    if _CACHE.exists():
        return CollagePhotosModel.model_validate_json(_CACHE.read_text()).root
    # TODO: implement live fetch from the Collage Photos data source.
    msg = (
        "Live fetch not yet implemented. Populate collage_photos_resources.json first."
    )
    raise NotImplementedError(msg)


if __name__ == "__main__":

    async def _main() -> None:
        async with httpx.AsyncClient(timeout=30) as _httpx_async_client:  # noqa: F841
            items = await bulk_import()
            for i, item in enumerate(items, start=1):
                print(f"{i:>2}. {item.title!r}")

    asyncio.run(_main())
