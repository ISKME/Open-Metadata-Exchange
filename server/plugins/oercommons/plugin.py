#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from server.plugins.oercommons.oercommons_models import Model

# from pydantic import BaseModel
from server.plugins.ome_plugin import EducationResource, OMEPlugin


class OERCommonsPlugin(OMEPlugin):
    """
    This class represents the OERCommons plugin, which is a subclass of OMEPlugin.
    It provides functionality to create metadata cards from URLs or JSON payloads.
    """

    mimetype: str = "application/vnd.oercommons.oer-commons+json"

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
        oercommons_item = Model.model_validate_json(json_payload)
        oercommons_item = oercommons_item.field_source
        return EducationResource(
            title=oercommons_item.title,
            description=oercommons_item.text,
            authors=oercommons_item.authors,
            authoring_institution=oercommons_item.provider_name,
            subject_tags=oercommons_item.keywords_names,
            creation_date=oercommons_item.published_on,
            last_modified_date=oercommons_item.modified_timestamp,
        )


if __name__ == "__main__":
    from pathlib import Path

    # The oercommons.json file should be in the same directory as this script.
    json_path = Path(__file__).parent / "oercommons.json"
    model_instance = Model.model_validate_json(json_path.read_text())
    print(f"{model_instance = }\n")
    print(f"{model_instance.field_index = }")
    print(f"{model_instance.field_type = }")
    print(f"{model_instance.field_id = }")
    print(f"{model_instance.field_score = }\n")
    plugin = OERCommonsPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetype = }")
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
