#!/usr/bin/env -S uv run --script

# Source: https://archive.org/metadata/{identifier}
# Docs: https://archive.org/developers/md-read.html

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from pydantic import BaseModel, Field, RootModel, field_validator


def _coerce_to_list(item: object) -> list[str]:
    """Normalize a string, list, or None value to a flat list of strings."""
    if isinstance(item, str):
        return [item]
    return list(item) if item is not None else []


class PrelingerItem(BaseModel):
    """
    Represents a single video item from the Prelinger Archives at the Internet Archive.

    Fields map directly to the ``metadata`` object returned by the md-read API:
    ``GET https://archive.org/metadata/{identifier}``

    Also used as the document type within ``PrelingerSearchResponseInner.docs`` since
    the Advanced Search API returns the same fields.
    """

    identifier: str = ""
    title: str = ""
    description: str = ""
    creator: list[str] = Field(default_factory=list)
    subject: list[str] = Field(default_factory=list)
    date: str = ""
    licenseurl: str = ""
    mediatype: str = ""

    @field_validator("creator", "subject", mode="before")
    @classmethod
    def coerce_to_list(cls, item: object) -> list[str]:
        """Normalize string or None values to a list of strings."""
        return _coerce_to_list(item)


class PrelingerMetadataResponse(BaseModel):
    """
    Full response envelope returned by ``GET https://archive.org/metadata/{identifier}``.
    """

    metadata: PrelingerItem


class PrelingerSearchResponseInner(BaseModel):
    model_config = {"populate_by_name": True}

    num_found: int = Field(default=0, alias="numFound")
    start: int = 0
    docs: list[PrelingerItem] = Field(default_factory=list)


class PrelingerSearchResponse(BaseModel):
    """
    Response from the Internet Archive advanced-search API used to discover
    Prelinger videos:
    ``GET https://archive.org/advancedsearch.php?q=collection:prelinger+...&output=json``
    """

    response: PrelingerSearchResponseInner


class PrelingerModel(RootModel[list[PrelingerItem]]):
    """A list of PrelingerItem objects, used for JSON serialisation of bulk imports."""


if __name__ == "__main__":
    from pathlib import Path

    here = Path(__file__).parent
    json_path = here / "prelinger_item.json"
    item = PrelingerItem.model_validate_json(json_path.read_text())
    print(f"{item = }")
    print(f"{item.title = }")
    print(f"{item.creator = }")
    print(f"{item.subject = }")
    print(f"{item.date = }")
