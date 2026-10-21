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
from server.plugins.wikipedia_images.wikipedia_images_models import (
    WikipediaImagesItem,
)


class WikipediaImagesPlugin(OMEPlugin):
    """Plugin for images (and their metadata) on https://en.wikipedia.org."""

    mimetypes: tuple[str, ...] = ("application/vnd.wikipedia.images+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.wikipedia_images": (
                "Metadata from Wikipedia images https://en.wikipedia.org"
            ),
        }
    )

    site_name: str = "Wikipedia Images"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://en.wikipedia.org/static/images/icons/wikipedia.png"

    def _make_metadata_card(self, item: WikipediaImagesItem) -> EducationResource:
        return EducationResource(
            title=item.title,
            description=item.description,
            authors=item.authors,
            authoring_institution=item.publisher,
            subject_tags=item.subjects,
            creation_date=item.date,
            last_modified_date=item.date,
            source_url=item.page_url or item.url,
            version_url=item.url,
            spdx_license_expression=item.license,
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a Python dict."""
        return self._make_metadata_card(WikipediaImagesItem(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        return self._make_metadata_card(
            WikipediaImagesItem.model_validate_json(json_payload)
        )

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """Not implemented yet."""
        msg = "This method is not implemented yet."
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = WikipediaImagesPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "wikipedia_images_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
