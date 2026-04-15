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

    title: str = Field(description="Book title.")
    description: str = Field(default="", description="Book description or abstract.")
    authors: list[str] = Field(default_factory=list, description="Book author names.")
    subject_tags: list[str] = Field(
        default_factory=list, description="Subject tags for discovery."
    )
    source_url: str = Field(default="", description="Canonical OpenStax book URL.")
    version_url: str = Field(
        default="", description="Optional URL for a specific version."
    )
    spdx_license_expression: str = Field(
        default="CC-BY-4.0", description="SPDX license expression."
    )
