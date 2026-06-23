#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

# Thoth Open Metadata GraphQL API response models.
# API docs: https://api.thoth.pub
# The `books` endpoint uses WORK_LIST_FIELDS (see thothlibrary/thoth-1_0_0/queries.py).

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ThothTitle(BaseModel):
    """A title entry for a Thoth work."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    title_id: str = ""
    locale_code: str = ""
    full_title: str = ""
    title: str = ""
    subtitle: str = ""
    canonical: bool = False


class ThothAbstract(BaseModel):
    """An abstract entry for a Thoth work."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    abstract_id: str = ""
    locale_code: str = ""
    content: str = ""
    abstract_type: str = ""
    canonical: bool = False


class ThothContribution(BaseModel):
    """A contributor entry for a Thoth work."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    contribution_id: str = ""
    contribution_type: str = ""
    full_name: str = ""
    contribution_ordinal: int = 0


class ThothSubject(BaseModel):
    """A subject/keyword entry for a Thoth work."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    subject_id: str = ""
    subject_type: str = ""
    subject_code: str = ""
    subject_ordinal: int = 0


class ThothPublication(BaseModel):
    """A publication record (PDF, EPUB, etc.) for a Thoth work."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    publication_id: str = ""
    publication_type: str = ""
    isbn: str | None = None


class ThothPublisher(BaseModel):
    """Publisher information for a Thoth imprint."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    publisher_id: str = ""
    publisher_name: str = ""
    publisher_shortname: str = ""
    publisher_url: str = ""


class ThothImprint(BaseModel):
    """Imprint information for a Thoth work."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    imprint_id: str = ""
    imprint_name: str = ""
    publisher: ThothPublisher | None = None


class ThothBook(BaseModel):
    """
    A single book record as returned by the Thoth GraphQL API ``books`` endpoint.

    The ``books`` endpoint uses ``WORK_LIST_FIELDS``, which includes titles,
    abstracts, contributions, subjects, and imprint, but does **not** include
    the ``license`` field (that requires fetching the full work via ``work_by_id``).

    Endpoint: POST https://api.thoth.pub/graphql
    Docs: https://api.thoth.pub
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    work_id: str = ""
    work_type: str = ""
    work_status: str = ""
    doi: str | None = None
    publication_date: str | None = None
    place: str = ""
    updated_at: str = ""
    titles: list[ThothTitle] = []
    abstracts: list[ThothAbstract] = []
    contributions: list[ThothContribution] = []
    subjects: list[ThothSubject] = []
    publications: list[ThothPublication] = []
    imprint: ThothImprint | None = None

    def canonical_title(self) -> str:
        """Return the canonical full title, falling back to the first title."""
        for t in self.titles:
            if t.canonical:
                return t.full_title or t.title
        if self.titles:
            return self.titles[0].full_title
        return ""

    def canonical_abstract(self) -> str:
        """Return the canonical abstract content, falling back to the first."""
        for a in self.abstracts:
            if a.canonical:
                return a.content
        if self.abstracts:
            return self.abstracts[0].content
        return ""

    def author_names(self) -> list[str]:
        """Return author full names sorted by contribution ordinal."""
        authors = sorted(
            [c for c in self.contributions if c.contribution_type == "AUTHOR"],
            key=lambda c: c.contribution_ordinal,
        )
        if authors:
            return [c.full_name for c in authors]
        return [
            c.full_name
            for c in sorted(self.contributions, key=lambda c: c.contribution_ordinal)
        ]

    def keyword_subjects(self) -> list[str]:
        """Return KEYWORD-type subject codes (free-text keywords)."""
        return [s.subject_code for s in self.subjects if s.subject_type == "KEYWORD"]

    @property
    def source_url(self) -> str:
        """Return the DOI URL, or the Thoth work page as a fallback."""
        if self.doi:
            return self.doi
        if self.work_id:
            return f"https://thoth.pub/work/{self.work_id}"
        return ""

    @property
    def publisher_name(self) -> str:
        """Return the publisher name from the imprint, if available."""
        if self.imprint and self.imprint.publisher:
            return self.imprint.publisher.publisher_name
        if self.imprint:
            return self.imprint.imprint_name
        return ""


if __name__ == "__main__":
    from pathlib import Path

    here = Path(__file__).parent
    book = ThothBook.model_validate_json((here / "thoth_item.json").read_text())
    print(f"{book.work_id = }")
    print(f"{book.canonical_title() = }")
    print(f"{book.source_url = }")
    print(f"{book.publisher_name = }")
    print(f"{book.author_names() = }")
    print(f"{book.keyword_subjects() = }")
