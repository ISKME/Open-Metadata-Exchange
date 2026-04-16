#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

# Pressbooks REST API response models.
# API docs: https://pressbooks.directory/wp-json/pressbooks/v2/books

from types import MappingProxyType

from pydantic import BaseModel, Field, field_validator

# Map Pressbooks license slugs to SPDX expressions.
PRESSBOOKS_LICENSE_TO_SPDX: dict[str, str] = MappingProxyType(  # type: ignore[assignment]
    {
        "cc-by": "CC-BY-4.0",
        "cc-by-sa": "CC-BY-SA-4.0",
        "cc-by-nd": "CC-BY-ND-4.0",
        "cc-by-nc": "CC-BY-NC-4.0",
        "cc-by-nc-sa": "CC-BY-NC-SA-4.0",
        "cc-by-nc-nd": "CC-BY-NC-ND-4.0",
        "cc0": "CC0-1.0",
        "public-domain": "LicenseRef-public-domain",
        "all-rights-reserved": "LicenseRef-all-rights-reserved",
    }
)


class PressbooksBookTitle(BaseModel):
    """WordPress REST API title object."""

    rendered: str = Field(default="", description="HTML-decoded book title.")


class PressbooksBookMetadata(BaseModel):
    """
    Pressbooks book metadata fields exposed by the network-catalog REST API.

    All fields are optional; missing keys arrive as empty strings.
    """

    pb_title: str = Field(default="", description="Full book title.")
    pb_subtitle: str = Field(default="", description="Book subtitle.")
    pb_short_title: str = Field(default="", description="Abbreviated title.")
    pb_authors: str = Field(
        default="",
        description="Semicolon-separated list of author names.",
    )
    pb_editors: str = Field(
        default="",
        description="Semicolon-separated list of editor names.",
    )
    pb_description: str = Field(default="", description="Book description / abstract.")
    pb_publisher: str = Field(default="", description="Publishing institution.")
    pb_publisher_city: str = Field(default="", description="Publisher city.")
    pb_publication_date: str = Field(
        default="",
        description="Publication year or ISO-8601 date string.",
    )
    pb_copyright_holder: str = Field(
        default="",
        description="Copyright holder name.",
    )
    pb_keywords_tags: str = Field(
        default="",
        description="Comma-separated subject keywords.",
    )
    pb_subject: str = Field(default="", description="Primary subject area.")
    pb_language: str = Field(default="en", description="BCP-47 language tag.")
    pb_license: str = Field(
        default="",
        description="Pressbooks license slug (e.g. 'cc-by').",
    )
    pb_cover_image: str = Field(
        default="",
        description="URL of the book cover image.",
    )
    pb_url: str = Field(default="", description="Canonical URL of the book.")

    @property
    def authors_list(self) -> list[str]:
        """Return authors as a list, splitting on semicolons."""
        return [a.strip() for a in self.pb_authors.split(";") if a.strip()]

    @property
    def subject_tags(self) -> list[str]:
        """Return subject tags as a list, splitting on commas."""
        tags: list[str] = []
        if self.pb_subject:
            tags.append(self.pb_subject.strip())
        for kw in self.pb_keywords_tags.split(","):
            if (kw := kw.strip()) and kw not in tags:
                tags.append(kw)
        return tags

    @property
    def spdx_license(self) -> str:
        """Translate the Pressbooks license slug to an SPDX expression."""
        return PRESSBOOKS_LICENSE_TO_SPDX.get(
            self.pb_license.lower(), self.pb_license
        )


class PressbooksBook(BaseModel):
    """
    A single book record as returned by the Pressbooks Directory REST API.

    Endpoint: GET https://pressbooks.directory/wp-json/pressbooks/v2/books
    """

    id: int = Field(description="WordPress post ID.")
    link: str = Field(default="", description="Canonical URL of the book.")
    title: PressbooksBookTitle = Field(
        default_factory=PressbooksBookTitle,
        description="WordPress title object.",
    )
    metadata: PressbooksBookMetadata = Field(
        default_factory=PressbooksBookMetadata,
        description="Pressbooks metadata fields.",
    )

    @field_validator("title", mode="before")
    @classmethod
    def coerce_title(cls, value: object) -> object:
        """Accept a plain string in addition to the standard {rendered: ...} dict."""
        if isinstance(value, str):
            return {"rendered": value}
        return value

    @property
    def book_url(self) -> str:
        """Return the best available URL for the book."""
        return self.metadata.pb_url or self.link


if __name__ == "__main__":
    from pathlib import Path

    here = Path(__file__).parent
    item = PressbooksBook.model_validate_json(
        (here / "pressbooks_item.json").read_text()
    )
    print(f"{item.title.rendered = }")
    print(f"{item.metadata.authors_list = }")
    print(f"{item.metadata.subject_tags = }")
    print(f"{item.metadata.spdx_license = }")
    print(f"{item.book_url = }")
