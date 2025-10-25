#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "httpx",
#   "pydantic",
# ]
# ///

# PYTHONPATH="." uv run scripts/get_metadata_from_newsgroup.py

from collections.abc import Iterator

import httpx

from server.plugins.ome_plugin import EducationResource


def get_metadata_from_newsgroup(
    newsgroup: str = "local.test",
) -> Iterator[EducationResource]:
    """
    Fetch metadata from a specified newsgroup via the FastAPI server.

    Args:
        newsgroup: The name of the newsgroup to fetch metadata from.

    Returns:
        Yield EducationResources containing metadata from the newsgroup.
    """
    url = f"http://localhost:5001/api/channel/{newsgroup}/cards?page_size=1000"
    for article in httpx.get(url).raise_for_status().json():
        yield EducationResource.model_validate_json(article["body"])


if __name__ == "__main__":
    for i, resource in enumerate(
        get_metadata_from_newsgroup(newsgroup="ome.qubes"), start=1
    ):
        print(f"{i:02d}: {resource})")
