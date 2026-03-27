#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from types import MappingProxyType

from server.plugins.eric.eric_models import Model, ModelItem

# from pydantic import BaseModel
from server.plugins.ome_plugin import EducationResource, OMEPlugin


class EricPlugin(OMEPlugin):
    """
    This class represents the Education Resources Information Center (ERIC) plugin.
    It provides functionality to create metadata cards from URLs or JSON payloads.
    """

    mimetypes: tuple[str] = ("application/vnd.eric.eric+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.eric": (
                "Metadata from US DoE's Education Resources Information Center (ERIC) "
                "https://eric.ed.gov"
            ),
        }
    )

    def make_metadata_card(self, doc: ModelItem) -> EducationResource:
        return EducationResource(
            title=doc.title,
            description=doc.description,
            authors=doc.author,
            authoring_institution=doc.publisher or "",
            subject_tags=doc.subject,
            creation_date=doc.publicationdateyear,
            last_modified_date=doc.publicationdateyear,  # TODO(cclauss): fix me
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """
        This method creates a metadata card from a dict of ERIC doc data.
        """
        return self.make_metadata_card(ModelItem(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """
        This method creates a metadata card from a given JSON payload.
        """
        return self.make_metadata_card(ModelItem.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        This method creates a metadata card from a given URL.
        It currently does not implement any functionality.
        """
        msg = "This method is not implemented yet."
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = EricPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    # The eric.json file should be in the same directory as this script.
    json_path = Path(__file__).parent / "eric.json"
    model_instance = Model.model_validate_json(json_path.read_text())
    response_instance = model_instance.response
    print(f"{response_instance.numFound = }")
    print(f"{response_instance.start = }")
    print(f"{response_instance.numFoundExact = }")

    json_path = Path(__file__).parent / "eric_item.json"
    doc_instance = ModelItem.model_validate_json(json_path.read_text())
    print(f"{doc_instance = }\n")
    print(f"{doc_instance.title = }")
    print(f"{doc_instance.author = }")
    print(f"{doc_instance.description = }")
    print(f"{doc_instance.subject = }\n")
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
