#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from types import MappingProxyType

# from pydantic import BaseModel
from server.plugins.ome_plugin import EducationResource, OMEPlugin
from server.plugins.qubes.qubes_models import Model, ModelItem
from server.plugins.qubes.utils import extract_from_url


class QubesPlugin(OMEPlugin):
    """
    This class represents the QUBES plugin, which is a subclass of OMEPlugin.
    It provides functionality to create metadata cards from URLs or JSON payloads.
    """

    mimetypes: tuple[str] = ("application/vnd.qubes+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.qubes": "Metadata from QUBES https://qubeshub.org",
        }
    )
    site_name: str = "Qubes"
    librarian_contact: str = "info@qubeshub.org"
    logo: str = "https://qubeshub.org/groups/bioquest/File:/uploads/assets/imgs/bioquest_logo_transparent.png"

    def summarize(self, card: EducationResource) -> str:
        return f"Summary: {card.description}"

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        This method creates a metadata card from a given URL.
        """
        return extract_from_url(url)

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """
        This method creates a metadata card from a given JSON payload.
        It currently does not implement any functionality.
        """
        qubes_record = ModelItem.model_validate_json(json_payload)
        return EducationResource(
            title=qubes_record.title,
            description=qubes_record.description,
            authors=qubes_record.creator,
            authoring_institution=qubes_record.identifier,
            subject_tags=qubes_record.subjects,
            creation_date=qubes_record.date,
            last_modified_date=qubes_record.date,
        )


if __name__ == "__main__":
    from pathlib import Path

    plugin = QubesPlugin()
    # The qubes_records.json file should be in the same directory as this script.
    json_path = Path(__file__).parent / "qubes_records.json"
    records = Model.model_validate_json(json_path.read_text()).root
    for i, record in enumerate(records, start=1):
        # print(f"{i:>2}. {record = }\n")
        print(f"{i:>2}. {record.title = }")
        print(f"{record.description = }")
        print(f"{record.creator = }")
        print(f"{record.date = }\n")

        print(f"{plugin = }")
        print(f"{plugin.mimetypes = }")
        # TODO(cclauss): fix the next line to read a list of json records.
        # print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
