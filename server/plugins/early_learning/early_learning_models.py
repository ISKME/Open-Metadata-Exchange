#!/usr/bin/env -S uv run --script

# Source: https://www.earlylearningresourcenetwork.org/books/search?f%5B0%5D=language%3A712
# This plugin uses web scraping (BeautifulSoup) because the site does not
# expose a public REST or JSON API.

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from datetime import datetime

from pydantic import BaseModel, RootModel


class EarlyLearningItem(BaseModel):
    title: str = ""
    url: str = ""
    description: str = ""
    authors: list[str] = []
    subjects: list[str] = []
    language: str = ""
    license: str = ""
    publisher: str = ""
    date: datetime | None = None


class EarlyLearningModel(RootModel[list[EarlyLearningItem]]):
    pass


if __name__ == "__main__":
    from pathlib import Path

    here = Path(__file__).parent
    json_path = here / "early_learning_resources.json"
    records = EarlyLearningModel.model_validate_json(json_path.read_text()).root
    for i, record in enumerate(records, start=1):
        print(f"\n{i:>2}. {record.title = }")
        print(f"    {record.url = }")
        print(f"    {record.authors = }")
        print(f"    {record.subjects = }")
        print(f"    {record.date = }")
