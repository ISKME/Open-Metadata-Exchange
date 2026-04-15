#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from pydantic import BaseModel, Field


class OpenStaxBook(BaseModel):
    """
    Represents a single OpenStax book entry.
    """

    title: str
    description: str = ""
    authors: list[str] = Field(default_factory=list)
    subject_tags: list[str] = Field(default_factory=list)
    source_url: str = ""
    version_url: str = ""
    spdx_license_expression: str = "CC-BY-4.0"
