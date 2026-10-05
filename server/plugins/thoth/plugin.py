#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
#     "thothlibrary",
# ]
# ///

import contextlib
from datetime import UTC, datetime
from types import MappingProxyType

from server.plugins.ome_plugin import EducationResource, OMEPlugin
from server.plugins.thoth.thoth_models import ThothBook


class ThothPlugin(OMEPlugin):
    """
    Plugin for Thoth Open Metadata (https://thoth.pub/books).

    Thoth is an open metadata management and dissemination system for open
    access books.  It provides a public GraphQL API used by academic publishers
    to record and share book metadata.

    This plugin uses the ``thothlibrary`` Python package to query the Thoth
    GraphQL API and translate book records into OME ``EducationResource`` cards.

    API docs: https://api.thoth.pub
    PyPI:     https://pypi.org/project/thothlibrary
    """

    mimetypes: tuple[str, ...] = ("application/vnd.thoth.book+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.thoth": (
                "Metadata from Thoth Open Metadata open access books "
                "https://thoth.pub/books"
            ),
        }
    )

    site_name: str = "Thoth Open Metadata"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://thoth.pub/assets/thoth-icon.png"

    def make_metadata_card(self, book: ThothBook) -> EducationResource:
        """Translate a ThothBook into an OME EducationResource."""
        pub_date: datetime | None = None
        if book.publication_date:
            with contextlib.suppress(ValueError):
                pub_date = datetime.strptime(
                    book.publication_date[:10], "%Y-%m-%d"
                ).replace(tzinfo=UTC)

        updated_at: datetime | None = None
        if book.updated_at:
            with contextlib.suppress(ValueError):
                updated_at = datetime.fromisoformat(book.updated_at)

        return EducationResource(
            title=book.canonical_title(),
            description=book.canonical_abstract(),
            authors=book.author_names(),
            authoring_institution=book.publisher_name,
            subject_tags=book.keyword_subjects(),
            creation_date=pub_date,
            last_modified_date=updated_at or pub_date,
            source_url=book.source_url,
            version_url=book.source_url,
            # NOTE: the `license` field is not returned by the Thoth `books`
            # list endpoint (WORK_LIST_FIELDS).  Fetch the full work via
            # `work_by_id` or `book_by_doi` if the license is required.
            spdx_license_expression="",
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a dict of Thoth book data."""
        return self.make_metadata_card(ThothBook.model_validate(doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        return self.make_metadata_card(ThothBook.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        Create a metadata card from a Thoth book URL.

        Direct URL lookup is not currently supported.
        Use bulk_import.py to fetch books from the Thoth GraphQL API.
        """
        msg = (
            "Direct URL lookup is not supported. "
            "Use bulk_import.py to fetch books from the Thoth GraphQL API."
        )
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = ThothPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "thoth_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
