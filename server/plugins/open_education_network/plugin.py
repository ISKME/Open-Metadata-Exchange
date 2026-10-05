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
from server.plugins.open_education_network.open_education_network_models import (
    OENTextbook,
)

# Map OEN license abbreviations to SPDX expressions.
OEN_LICENSE_TO_SPDX: MappingProxyType[str, str] = MappingProxyType(
    {
        "CC BY": "CC-BY-4.0",
        "CC BY-SA": "CC-BY-SA-4.0",
        "CC BY-ND": "CC-BY-ND-4.0",
        "CC BY-NC": "CC-BY-NC-4.0",
        "CC BY-NC-SA": "CC-BY-NC-SA-4.0",
        "CC BY-NC-ND": "CC-BY-NC-ND-4.0",
        "CC0": "CC0-1.0",
        "Public Domain": "LicenseRef-public-domain",
    }
)


class OpenEducationNetworkPlugin(OMEPlugin):
    """
    Plugin for the Open Education Network (OEN) open textbook library.

    Translates OEN API textbook records into OME EducationResource cards using
    the public JSON API at:
        https://open.umn.edu/opentextbooks/textbooks.json
    """

    mimetypes: tuple[str, ...] = (
        "application/vnd.open-education-network.textbook+json",
    )
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.open_education_network": (
                "Metadata from Open Education Network open textbooks "
                "https://open.umn.edu/opentextbooks"
            ),
        }
    )

    site_name: str = "Open Education Network"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://open.umn.edu/assets/oen-logo.png"

    def _spdx_license(self, abbreviation: str) -> str:
        """Translate an OEN license abbreviation to an SPDX expression."""
        return OEN_LICENSE_TO_SPDX.get(abbreviation.strip(), abbreviation)

    def make_metadata_card(self, book: OENTextbook) -> EducationResource:
        """Translate an OENTextbook record into an OME EducationResource."""
        return EducationResource(
            title=book.title,
            description=book.description,
            authors=book.authors,
            authoring_institution="Open Education Network",
            subject_tags=book.subject_tags,
            source_url=book.url,
            spdx_license_expression=self._spdx_license(book.license.abbreviation),
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a dict of OEN textbook data."""
        return self.make_metadata_card(OENTextbook(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        return self.make_metadata_card(OENTextbook.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        Direct URL lookup is not supported for this plugin.

        Use bulk_import.py to fetch textbooks from the OEN API.
        """
        msg = (
            "Direct URL lookup is not supported. "
            "Use bulk_import.py to fetch textbooks from the Open Education Network API."
        )
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = OpenEducationNetworkPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "open_education_network_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
