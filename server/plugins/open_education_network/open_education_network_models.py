#!/usr/bin/env -S uv run --script
#
# Source: https://open.umn.edu/opentextbooks/textbooks.json
# Docs: https://open.umn.edu/opentextbooks/api-docs/index.html
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from pydantic import BaseModel, Field, RootModel


class OENLicense(BaseModel):
    """License information for an Open Education Network textbook."""

    name: str = Field(default="", description="Full license name.")
    abbreviation: str = Field(
        default="", description="License abbreviation (e.g., 'CC BY-NC-SA')."
    )
    url: str = Field(default="", description="URL to the license text.")


class OENChildSubject(BaseModel):
    """A child subject for an Open Education Network textbook."""

    name: str = Field(default="", description="Child subject name.")


class OENSubject(BaseModel):
    """A subject entry for an Open Education Network textbook."""

    name: str = Field(default="", description="Subject name.")
    child_subject: OENChildSubject = Field(
        default_factory=OENChildSubject,
        description="Optional child subject.",
    )


class OENContributor(BaseModel):
    """A contributor (author, editor, etc.) for an Open Education Network textbook."""

    first_name: str = Field(default="", description="Contributor first name.")
    last_name: str = Field(default="", description="Contributor last name.")
    contribution_type: str = Field(
        default="", description="Contribution type (e.g., 'author', 'editor')."
    )

    @property
    def full_name(self) -> str:
        """Return the contributor's full name."""
        return " ".join(filter(None, [self.first_name, self.last_name]))


class OENFormat(BaseModel):
    """A format (eBook, PDF, etc.) for an Open Education Network textbook."""

    format: str = Field(default="", description="Format name (e.g., 'eBook', 'PDF').")
    url: str = Field(default="", description="URL to this format of the resource.")


class OENTextbook(BaseModel):
    """
    A single textbook record as returned by the Open Education Network API.

    Endpoint: GET https://open.umn.edu/opentextbooks/textbooks.json
    """

    id: int = Field(description="Textbook ID.")
    title: str = Field(default="", description="Textbook title.")
    description: str = Field(default="", description="Textbook description.")
    url: str = Field(default="", description="Canonical URL for the textbook.")
    cover_url: str = Field(default="", description="URL for the cover image.")
    license: OENLicense = Field(
        default_factory=OENLicense, description="License information."
    )
    subjects: list[OENSubject] = Field(
        default_factory=list, description="Subject list."
    )
    contributors: list[OENContributor] = Field(
        default_factory=list, description="Contributor list."
    )
    formats: list[OENFormat] = Field(
        default_factory=list, description="Available formats (eBook, PDF, etc.)."
    )

    @property
    def authors(self) -> list[str]:
        """Return a list of author names."""
        return [
            c.full_name
            for c in self.contributors
            if c.contribution_type.lower() == "author" and c.full_name
        ]

    @property
    def subject_tags(self) -> list[str]:
        """Return a flat list of subject and child-subject names."""
        tags: list[str] = []
        for subject in self.subjects:
            if subject.name and subject.name not in tags:
                tags.append(subject.name)
            child = subject.child_subject.name
            if child and child not in tags:
                tags.append(child)
        return tags


class OENTextbookList(RootModel[list[OENTextbook]]):
    """A list of Open Education Network textbooks."""


if __name__ == "__main__":
    from pathlib import Path

    here = Path(__file__).parent

    item = OENTextbook.model_validate_json(
        (here / "open_education_network_item.json").read_text()
    )
    print(f"{item.title = }")
    print(f"{item.authors = }")
    print(f"{item.subject_tags = }")
    print(f"{item.license.abbreviation = }")
    print()

    books_path = here / "open_education_network_python_books.json"
    books = OENTextbookList.model_validate_json(books_path.read_text())
    for book in books.root:
        print(f"  {book.title!r}  {book.authors}  {book.license.abbreviation}")
