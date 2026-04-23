#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from datetime import UTC, datetime
from types import MappingProxyType

from server.plugins.oapen_books.oapen_models import OapenItem
from server.plugins.ome_plugin import EducationResource, OMEPlugin


class OapenBooksPlugin(OMEPlugin):
    """
    Plugin for the OAPEN Library (https://library.oapen.org).

    The OAPEN (Open Access Publishing in European Networks) Library hosts
    peer-reviewed open access books and book chapters, primarily from European
    academic publishers.  This plugin uses the public OAPEN DSpace REST API
    to translate book metadata into OME EducationResource cards.

    API docs: https://library.oapen.org/rest/
    """

    mimetypes: tuple[str, ...] = ("application/vnd.oapen.book+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.oapen_books": (
                "Metadata from OAPEN Library open access books "
                "https://library.oapen.org"
            ),
        }
    )

    site_name: str = "OAPEN Library"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://oapen.org/img/oapen-logo.jpg"

    def make_metadata_card(self, item: OapenItem) -> EducationResource:
        """Translate an OapenItem into an OME EducationResource."""
        pub_date: datetime | None = None
        if year_str := item.get_metadata_value("dc.date.issued"):
            try:
                year = int(year_str[:4])
                pub_date = datetime(year, 1, 1, tzinfo=UTC)
            except ValueError:
                pass

        return EducationResource(
            title=item.get_metadata_value("dc.title") or item.name,
            description=item.get_metadata_value("dc.description.abstract"),
            authors=item.get_metadata_values("dc.contributor.author"),
            authoring_institution=item.get_metadata_value("dc.publisher"),
            subject_tags=item.get_metadata_values("dc.subject"),
            creation_date=pub_date,
            last_modified_date=pub_date,
            source_url=item.source_url,
            spdx_license_expression=item.spdx_license,
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a dict of OAPEN item data."""
        return self.make_metadata_card(OapenItem(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        return self.make_metadata_card(OapenItem.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        Create a metadata card from a book URL.

        Direct URL lookup is not currently supported.
        Use bulk_import.py to fetch books from the OAPEN REST API.
        """
        msg = (
            "Direct URL lookup is not supported. "
            "Use bulk_import.py to fetch books from the OAPEN Library REST API."
        )
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = OapenBooksPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "oapen_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
