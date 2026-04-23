#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from types import MappingProxyType

from server.plugins.collage_photos.collage_photos_models import CollagePhotosItem
from server.plugins.ome_plugin import EducationResource, OMEPlugin


class CollagePhotosPlugin(OMEPlugin):
    """
    Plugin for Collage Photos metadata integration.

    Translates photo/image resource metadata into standardised OME
    EducationResource cards.
    """

    mimetypes: tuple[str, ...] = ("application/vnd.collage.photos+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.collage_photos": (
                "Metadata from Collage Photos educational image collection "
                "https://oercommons.org"
            ),
        }
    )

    site_name: str = "Collage Photos"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://oercommons.org/static/newdesign/images/header/oerc-logo.png"

    def _make_metadata_card(self, item: CollagePhotosItem) -> EducationResource:
        return EducationResource(
            title=item.title,
            description=item.description,
            authors=item.authors,
            authoring_institution=item.publisher,
            subject_tags=item.subjects,
            creation_date=item.date,
            last_modified_date=item.date,
            source_url=item.url,
            version_url=item.url,
            spdx_license_expression=item.license,
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a Python dict."""
        return self._make_metadata_card(CollagePhotosItem(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        return self._make_metadata_card(
            CollagePhotosItem.model_validate_json(json_payload)
        )

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        This method creates a metadata card from a given URL.
        It currently does not implement any functionality.
        """
        msg = "This method is not implemented yet."
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = CollagePhotosPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "collage_photos_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
