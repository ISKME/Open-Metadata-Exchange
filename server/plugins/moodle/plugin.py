#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from server.plugins.eric.eric_models import Model

# from pydantic import BaseModel
from server.plugins.ome_plugin import EducationResource, OMEPlugin


class MoodlePlugin(OMEPlugin):
    """
    This class represents the Moodle plugin, which is a subclass of OMEPlugin.
    It provides functionality to create metadata cards from URLs or JSON payloads.
    """

    mimetypes: tuple[str] = ("application/vnd.moodle.moodle+json",)

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
        eric_item = Model.model_validate_json(json_payload)
        return EducationResource(
            title=eric_item.title,
            description=eric_item.description,
            authors=eric_item.author,
            authoring_institution=eric_item.publisher,
            subject_tags=eric_item.subject,
            creation_date=eric_item.publicationdateyear,
            last_modified_date=eric_item.publicationdateyear,  # TODO(cclauss): fix me
        )


if __name__ == "__main__":
    from pathlib import Path

    # The oercommons.json file should be in the same directory as this script.
    json_path = Path(__file__).parent / "eric_item.json"
    model_instance = Model.model_validate_json(json_path.read_text())
    print(f"{model_instance = }\n")
    print(f"{model_instance.title = }")
    print(f"{model_instance.author = }")
    print(f"{model_instance.description = }")
    print(f"{model_instance.subject = }\n")
    plugin = MoodlePlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
