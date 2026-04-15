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
from server.plugins.openstax.openstax_models import OpenStaxBook


class OpenStaxPlugin(OMEPlugin):
    """
    Plugin to translate OpenStax book metadata to OME EducationResource cards.
    """

    mimetypes: tuple[str, ...] = ("application/vnd.openstax.book+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.openstax": (
                "Metadata from OpenStax open textbooks "
                "https://openstax.org/subjects/computer-science"
            ),
        }
    )

    site_name: str = "OpenStax"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://openstax.org/dist/images/logos/logo.svg"

    def make_metadata_card(self, book: OpenStaxBook) -> EducationResource:
        return EducationResource(
            title=book.title,
            description=book.description,
            authors=book.authors,
            authoring_institution="OpenStax",
            subject_tags=book.subject_tags,
            source_url=book.source_url,
            version_url=book.version_url,
            spdx_license_expression=book.spdx_license_expression,
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """
        Create metadata card from a dict of OpenStax book data.
        """
        return self.make_metadata_card(OpenStaxBook(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """
        Create metadata card from a JSON payload.
        """
        return self.make_metadata_card(OpenStaxBook.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        Create metadata card from a URL.
        """
        msg = (
            "This method is not implemented yet. "
            "Use bulk_import.py to fetch and parse the subject listing."
        )
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    json_path = Path(__file__).parent / "openstax_item.json"
    model_instance = OpenStaxBook.model_validate_json(json_path.read_text())
    print(f"{model_instance = }\n")
    plugin = OpenStaxPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
