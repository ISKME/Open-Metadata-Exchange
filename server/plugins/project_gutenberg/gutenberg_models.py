#!/usr/bin/env -S uv run --script

# Source: https://gutendex.com/books/?search=Sherlock+Holmes
# Docs: https://gutendex.com/

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///
#
# Pydantic models for the Gutendex REST API (https://gutendex.com/), a
# community-maintained JSON API for Project Gutenberg books.

from pydantic import BaseModel


class GutenbergAuthor(BaseModel):
    """An author record as returned by the Gutendex API."""

    name: str
    birth_year: int | None = None
    death_year: int | None = None


class GutenbergBook(BaseModel):
    """
    A single book record as returned by the Gutendex API.

    Endpoint: GET https://gutendex.com/books/?search=<query>
    """

    id: int
    title: str
    authors: list[GutenbergAuthor] = []
    translators: list[GutenbergAuthor] = []
    subjects: list[str] = []
    bookshelves: list[str] = []
    languages: list[str] = []
    copyright: bool | None = None
    media_type: str = ""
    formats: dict[str, str] = {}
    download_count: int = 0

    @property
    def source_url(self) -> str:
        """Return the canonical Project Gutenberg URL for this book."""
        return f"https://www.gutenberg.org/ebooks/{self.id}"

    @property
    def author_names(self) -> list[str]:
        """Return author names in natural order (first last).

        Gutenberg stores names as "Last, First"; split on the first comma
        and reassemble as "First Last".
        """
        names = []
        for author in self.authors:
            # Split "Last, First" into two parts; leave unchanged if no comma.
            parts = author.name.split(", ", 1)
            last_first_parts = 2
            names.append(
                f"{parts[1]} {parts[0]}"
                if len(parts) == last_first_parts
                else author.name
            )
        return names


class GutenbergSearchResponse(BaseModel):
    """
    Paginated search response from the Gutendex API.

    Endpoint: GET https://gutendex.com/books/?search=<query>&page=<n>
    """

    count: int
    next: str | None = None
    previous: str | None = None
    results: list[GutenbergBook] = []


if __name__ == "__main__":
    from pathlib import Path

    here = Path(__file__).parent
    item = GutenbergBook.model_validate_json((here / "gutenberg_item.json").read_text())
    print(f"{item.id = }")
    print(f"{item.title = }")
    print(f"{item.author_names = }")
    print(f"{item.subjects = }")
    print(f"{item.source_url = }")

    search = GutenbergSearchResponse.model_validate_json(
        (here / "gutenberg_search.json").read_text()
    )
    print(f"\n{search.count = }")
    for book in search.results:
        print(f"  {book.id}: {book.title!r} by {book.author_names}")
