#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from datetime import datetime

from pydantic import BaseModel, RootModel


class WikipediaImagesItem(BaseModel):
    """Metadata for one image on a Wikipedia page, from the MediaWiki imageinfo API."""

    id: str = ""
    title: str = ""
    description: str = ""
    url: str = ""
    page_url: str = ""
    source_page: str = ""
    authors: list[str] = []
    subjects: list[str] = []
    license: str = ""
    publisher: str = "Wikimedia Commons"
    date: datetime | None = None
    local_file: str = ""


class WikipediaImagesModel(RootModel[list[WikipediaImagesItem]]):
    pass


if __name__ == "__main__":
    from pathlib import Path

    json_path = Path(__file__).parent / "wikipedia_images_item.json"
    item = WikipediaImagesItem.model_validate_json(json_path.read_text())
    print(f"{item = }")
