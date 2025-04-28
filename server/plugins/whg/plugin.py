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
from server.plugins.whg.whg_models import Feature


class WHGPlugin(OMEPlugin):
    """
    This class represents the World Historical Gazetteer (WHG) plugin.
    It provides functionality to create metadata cards from URLs or JSON payloads.
    """

    mimetypes: tuple[str] = ("application/vnd.whg.whg+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "whg.public": (
                "Metadata from World Historical Gazetteer (WHG) https://whgazetteer.org"
            ),
        }
    )

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        This method creates a metadata card from a given URL.
        It currently does not implement any functionality.
        """
        msg = "This method is not implemented yet."
        raise NotImplementedError(msg)

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """
        This method creates a metadata card from a given JSON payload.
        It currently does not implement any functionality.
        """
        whg_item = Feature.model_validate_json(json_payload)
        return EducationResource(
            title=whg_item.title,
            description=whg_item.description,
            authors=[whg_item.creator, *(whg_item.contributors or "").split("; ")],
            authoring_institution=whg_item.owner,
            subject_tags=whg_item.datatype.split(", "),
            creation_date=whg_item.create_date,
            last_modified_date=whg_item.create_date,
        )


if __name__ == "__main__":
    from pathlib import Path

    # The oercommons.json file should be in the same directory as this script.
    json_path = Path(__file__).parent / "whg_item.json"
    model_instance = Feature.model_validate_json(json_path.read_text())
    print(f"{model_instance = }\n")
    print(f"{model_instance.owner = }")
    print(f"{model_instance.title = }")
    print(f"{model_instance.creator = }")
    print(f"{model_instance.description = }")
    print(f"{model_instance.contributors = }\n")
    plugin = WHGPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
