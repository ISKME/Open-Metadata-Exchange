#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from types import MappingProxyType

from server.plugins.early_learning.early_learning_models import (
    EarlyLearningItem,
    EarlyLearningModel,
)
from server.plugins.ome_plugin import EducationResource, OMEPlugin


class EarlyLearningPlugin(OMEPlugin):
    """Plugin for Early Learning Resource Network metadata integration."""

    mimetypes: tuple[str, ...] = ("application/vnd.earlylearning.early-learning+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.early_learning": (
                "Metadata from Early Learning Resource Network "
                "https://www.earlylearningresourcenetwork.org"
            ),
        }
    )

    site_name: str = "Early Learning Resource Network"
    librarian_contact: str = "info@iskme.org"
    logo: str = (
        "https://www.earlylearningresourcenetwork.org/themes/custom/elrn/logo.png"
    )

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        item = EarlyLearningItem.model_validate_json(json_payload)
        return self._make_metadata_card(item)

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a Python dict."""
        return self._make_metadata_card(EarlyLearningItem(**doc_dict))

    def _make_metadata_card(self, item: EarlyLearningItem) -> EducationResource:
        return EducationResource(
            title=item.title,
            description=item.description,
            authors=item.authors,
            authoring_institution=item.publisher,
            subject_tags=item.subjects,
            creation_date=item.date,
            last_modified_date=item.date,
            source_url=item.url,
            spdx_license_expression=item.license,
        )


if __name__ == "__main__":
    from pathlib import Path

    plugin = EarlyLearningPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    # The early_learning_resources.json file should be in the same directory
    # as this script.
    json_path = Path(__file__).parent / "early_learning_resources.json"
    records = EarlyLearningModel.model_validate_json(json_path.read_text()).root
    print(f"Loaded {len(records)} records from {json_path.name}")

    json_path = Path(__file__).parent / "early_learning_item.json"
    item = EarlyLearningItem.model_validate_json(json_path.read_text())
    print(f"\n{item = }")
    print(f"{item.title = }")
    print(f"{item.authors = }")
    print(f"{item.subjects = }")
    print(f"\n{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
