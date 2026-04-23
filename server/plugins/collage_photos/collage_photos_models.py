#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///
#
# Pydantic models for Collage photo metadata records.

from datetime import datetime

from pydantic import BaseModel, RootModel


class CollagePhotosItem(BaseModel):
    id: str = ""
    title: str = ""
    description: str = ""
    url: str = ""
    authors: list[str] = []
    subjects: list[str] = []
    license: str = ""
    publisher: str = ""
    date: datetime | None = None


class CollagePhotosModel(RootModel[list[CollagePhotosItem]]):
    pass


if __name__ == "__main__":
    from pathlib import Path

    json_path = Path(__file__).parent / "collage_photos_item.json"
    item = CollagePhotosItem.model_validate_json(json_path.read_text())
    print(f"{item = }")
    print(f"{item.title = }")
    print(f"{item.authors = }")
