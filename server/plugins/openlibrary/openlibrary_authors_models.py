#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///
#
# generated by datamodel-codegen:
#   filename:  openlibrary_authors.json
#   timestamp: 2025-03-31T11:22:23+00:00
#
# Source:
# * https://openlibrary.org/works/OL262477W.json
# * https://openlibrary.org/authors/OL161167A.json
# Docs: https://openlibrary.org/developers/api
#
# This file is generated by datamodel-code-generator.
# Generated with command:
# uv tool run --from=datamodel-code-generator datamodel-codegen \
#             --input openlibrary_authors.json --input-file-type json \
#             --output openlibrary_authors_models.py

from __future__ import annotations

from pydantic import BaseModel


class Type(BaseModel):
    key: str


class Link(BaseModel):
    title: str
    url: str
    type: Type


class RemoteIds(BaseModel):
    wikidata: str


class Created(BaseModel):
    type: str
    value: str


class LastModified(BaseModel):
    type: str
    value: str


class Model(BaseModel):
    photos: list[int]
    date: str
    entity_type: str
    source_records: list[str]
    links: list[Link]
    personal_name: str
    name: str
    birth_date: str
    title: str
    key: str
    remote_ids: RemoteIds
    bio: str
    type: Type
    alternate_names: list[str]
    death_date: str
    latest_revision: int
    revision: int
    created: Created
    last_modified: LastModified


if __name__ == "__main__":
    from pathlib import Path

    # The openlibrary_authors.json file should be in the same directory as this script.
    json_path = Path(__file__).parent / "openlibrary_authors.json"
    model_instance = Model.model_validate_json(json_path.read_text())
    print(f"{model_instance = }\n")
    print(f"{model_instance.birth_date = }")
    print(f"{model_instance.remote_ids = }")
    print(f"{model_instance.created = }")
    print(f"{model_instance.last_modified = }")
    print(f"{model_instance.bio = }")
