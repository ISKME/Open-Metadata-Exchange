#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from datetime import datetime
from types import MappingProxyType

from server.plugins.libretexts.libretexts_models import LibreTextsBook
from server.plugins.ome_plugin import EducationResource, OMEPlugin

# Map LibreTexts license labels to SPDX expressions.
LICENSE_TO_SPDX: MappingProxyType[str, str] = MappingProxyType(
    {
        "CC BY 4.0": "CC-BY-4.0",
        "CC BY-SA 4.0": "CC-BY-SA-4.0",
        "CC BY-ND 4.0": "CC-BY-ND-4.0",
        "CC BY-NC 4.0": "CC-BY-NC-4.0",
        "CC BY-NC-SA 4.0": "CC-BY-NC-SA-4.0",
        "CC BY-NC-ND 4.0": "CC-BY-NC-ND-4.0",
        "CC0": "CC0-1.0",
        "Public Domain": "LicenseRef-public-domain",
    }
)


def _parse_date(value: str) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if value else None
    except ValueError:
        return None


class LibreTextsPlugin(OMEPlugin):
    """
    Plugin for LibreTexts Commons open textbooks.

    Translates LibreTexts Commons catalog records into OME EducationResource cards
    using the public JSON API at:
        https://commons.libretexts.org/api/v1/commons/catalog
    """

    mimetypes: tuple[str, ...] = ("application/vnd.libretexts.book+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.libretexts": (
                "Metadata from LibreTexts Commons https://commons.libretexts.org"
            ),
        }
    )

    site_name: str = "LibreTexts"
    librarian_contact: str = "info@libretexts.org"
    logo: str = "https://commons.libretexts.org/favicon.ico"

    def make_metadata_card(self, book: LibreTextsBook) -> EducationResource:
        """Translate a LibreTextsBook record into an OME EducationResource."""
        tags = [t for t in (book.library, book.subject, book.course) if t]
        return EducationResource(
            title=book.title,
            description=book.summary,
            authors=[book.author] if book.author else [],
            authoring_institution=book.institution or "LibreTexts",
            subject_tags=tags,
            last_modified_date=_parse_date(book.last_updated),
            source_url=book.links.online,
            spdx_license_expression=LICENSE_TO_SPDX.get(
                book.license.strip(), book.license
            ),
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a dict of LibreTexts book data."""
        return self.make_metadata_card(LibreTextsBook.model_validate(doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        return self.make_metadata_card(LibreTextsBook.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """Direct URL lookup is not supported; use bulk_import.py."""
        msg = "Direct URL lookup is not supported. Use bulk_import.py instead."
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = LibreTextsPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "libretexts_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
