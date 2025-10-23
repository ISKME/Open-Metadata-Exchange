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
from server.plugins.openlibrary.openlibrary_authors_models import Model as AuthorsModel
from server.plugins.openlibrary.openlibrary_work_models import Model as WorkModel

unused = AuthorsModel


class OpenLibraryPlugin(OMEPlugin):
    """
    This class represents the Open Library plugin, which is a subclass of OMEPlugin.
    It provides functionality to create metadata cards from URLs or JSON payloads.
    """

    mimetypes: tuple[str] = (
        "application/vnd.openlibrary.authors+json",
        "application/vnd.openlibrary.work+json",
    )
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.openlibrary": "Metadata from the Internet Archive's Open Library https://openlibrary.org",
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
        oercommons_item = WorkModel.model_validate_json(json_payload)
        return EducationResource(
            title=oercommons_item.title,
            description=oercommons_item.description,
            authors=[str(author for author in oercommons_item.authors)],
            authoring_institution="Open Library (https://openlibrary.org)",
            subject_tags=oercommons_item.subjects,
            creation_date=oercommons_item.created.value,
            last_modified_date=oercommons_item.last_modified.value,
        )


if __name__ == "__main__":
    from pathlib import Path

    # The oercommons.json file should be in the same directory as this script.
    json_path = Path(__file__).parent / "openlibrary_work.json"
    model_instance = WorkModel.model_validate_json(json_path.read_text())
    print(f"{model_instance = }\n")
    print(f"{model_instance.type = }")
    print(f"{model_instance.authors = }")
    print(f"{model_instance.created = }")
    print(f"{model_instance.last_modified = }\n")
    plugin = OpenLibraryPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
