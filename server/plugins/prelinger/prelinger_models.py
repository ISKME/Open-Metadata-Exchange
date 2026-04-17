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


class PrelingerItem(BaseModel):
    """
    Represents a single video item from the Prelinger Archives at the Internet Archive.

    Fields map directly to the ``metadata`` object returned by the md-read API:
    ``GET https://archive.org/metadata/{identifier}``
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
    def coerce_to_list(cls, v: object) -> list[str]:
        """Normalize string or None values to a list of strings."""
        if isinstance(v, str):
            return [v]
        return list(v) if v is not None else []


class PrelingerMetadataResponse(BaseModel):
    """
    Full response envelope returned by ``GET https://archive.org/metadata/{identifier}``.
    """

    metadata: PrelingerItem


class PrelingerSearchDoc(BaseModel):
    """A single document returned inside the ``response.docs`` list of an advanced search."""

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
    def coerce_to_list(cls, v: object) -> list[str]:
        """Normalize string or None values to a list of strings."""
        if isinstance(v, str):
            return [v]
        return list(v) if v is not None else []


class PrelingerSearchResponseInner(BaseModel):
    numFound: int = 0
    start: int = 0
    docs: list[PrelingerSearchDoc] = Field(default_factory=list)


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
