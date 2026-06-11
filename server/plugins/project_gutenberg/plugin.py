#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from types import MappingProxyType

from server.plugins.ome_plugin import EducationResource, OMEPlugin
from server.plugins.project_gutenberg.gutenberg_models import (
    GutenbergBook,
    GutenbergSearchResponse,
)

GUTENBERG_BASE_URL = "https://www.gutenberg.org"


class ProjectGutenbergPlugin(OMEPlugin):
    """
    Plugin for Project Gutenberg (https://www.gutenberg.org).

    Project Gutenberg is the oldest digital library, offering over 70,000
    free e-books — mainly literary works for which copyright has expired in
    the United States and are therefore in the public domain.  This plugin
    uses the Gutendex public REST/JSON API (https://gutendex.com/) to
    translate book metadata into OME EducationResource cards.

    API docs: https://gutendex.com/
    """

    mimetypes: tuple[str, ...] = ("application/vnd.gutenberg.book+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.project_gutenberg": (
                "Metadata from Project Gutenberg free e-books "
                "https://www.gutenberg.org"
            ),
        }
    )

    site_name: str = "Project Gutenberg"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://www.gutenberg.org/gutenberg/pg-logo-129x80.png"

    def make_metadata_card(self, book: GutenbergBook) -> EducationResource:
        """Translate a GutenbergBook into an OME EducationResource."""
        return EducationResource(
            title=book.title,
            description="",
            authors=book.author_names,
            authoring_institution="Project Gutenberg (https://www.gutenberg.org)",
            subject_tags=book.subjects + book.bookshelves,
            source_url=book.source_url,
            version_url=book.source_url,
            spdx_license_expression="LicenseRef-public-domain",
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a raw Gutendex book dict."""
        return self.make_metadata_card(GutenbergBook(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a Gutendex book JSON string."""
        return self.make_metadata_card(GutenbergBook.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        Create a metadata card from a book URL.

        Direct URL lookup is not currently supported.
        Use bulk_import.py to fetch books from the Gutendex REST API.
        """
        msg = (
            "Direct URL lookup is not supported. "
            "Use bulk_import.py to fetch books from the Gutendex REST API "
            "(https://gutendex.com/)."
        )
        raise NotImplementedError(msg)

    def make_metadata_cards_from_search_json(
        self, json_payload: str
    ) -> list[EducationResource]:
        """Create EducationResource cards from a Gutendex search response JSON string."""
        search = GutenbergSearchResponse.model_validate_json(json_payload)
        return [self.make_metadata_card(book) for book in search.results]


if __name__ == "__main__":
    from pathlib import Path

    plugin = ProjectGutenbergPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "gutenberg_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")

    search_path = Path(__file__).parent / "gutenberg_search.json"
    cards = plugin.make_metadata_cards_from_search_json(search_path.read_text())
    print(f"\nSearch results: {len(cards)} books")
    for card in cards:
        print(f"  {card.title!r}  by {card.authors}")
