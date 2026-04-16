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
from server.plugins.pressbooks.pressbooks_models import PressbooksBook


class PressbooksPlugin(OMEPlugin):
    """
    Plugin for the Pressbooks Directory (https://pressbooks.directory).

    Translates Pressbooks REST API book records into OME EducationResource cards
    using the public JSON API at:
        https://pressbooks.directory/wp-json/pressbooks/v2/books
    """

    mimetypes: tuple[str, ...] = ("application/vnd.pressbooks.book+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.pressbooks": (
                "Metadata from Pressbooks Directory open textbooks "
                "https://pressbooks.directory"
            ),
        }
    )

    site_name: str = "Pressbooks Directory"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://pressbooks.org/app/themes/pressbooks-org/images/pressbooks-logo.svg"

    def make_metadata_card(self, book: PressbooksBook) -> EducationResource:
        """Translate a PressbooksBook record into an OME EducationResource."""
        meta = book.metadata
        return EducationResource(
            title=meta.pb_title or book.title.rendered,
            description=meta.pb_description,
            authors=meta.authors_list,
            authoring_institution=meta.pb_publisher,
            subject_tags=meta.subject_tags,
            source_url=book.book_url,
            spdx_license_expression=meta.spdx_license,
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a dict of Pressbooks book data."""
        return self.make_metadata_card(PressbooksBook(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        return self.make_metadata_card(
            PressbooksBook.model_validate_json(json_payload)
        )

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        Fetch a single Pressbooks book record from the REST API by URL.

        The URL should be the canonical book URL (e.g. https://example.pressbooks.com).
        The plugin will query the Pressbooks Directory REST API to find a matching
        book record.
        """
        msg = (
            "Direct URL lookup is not supported. "
            "Use bulk_import.py to fetch books from the Pressbooks Directory API."
        )
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = PressbooksPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "pressbooks_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
