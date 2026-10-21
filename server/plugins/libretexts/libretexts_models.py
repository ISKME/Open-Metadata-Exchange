#!/usr/bin/env -S uv run --script
#
# Source: https://commons.libretexts.org/api/v1/commons/catalog
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from pydantic import BaseModel, Field, RootModel


class LibreTextsLinks(BaseModel):
    """Download and viewing links for a LibreTexts Commons book."""

    online: str = ""
    pdf: str = ""
    buy: str = ""
    zip: str = ""
    files: str = ""
    lms: str = ""


class LibreTextsBook(BaseModel):
    """A book record from the LibreTexts Commons catalog API."""

    book_id: str = Field(default="", alias="bookID")
    title: str = ""
    author: str = ""
    institution: str = ""
    library: str = ""
    subject: str = ""
    course: str = ""
    program: str = ""
    license: str = ""
    summary: str = ""
    thumbnail: str = ""
    links: LibreTextsLinks = Field(default_factory=LibreTextsLinks)
    last_updated: str = Field(default="", alias="lastUpdated")


class LibreTextsBookList(RootModel[list[LibreTextsBook]]):
    """A list of LibreTexts Commons books."""
