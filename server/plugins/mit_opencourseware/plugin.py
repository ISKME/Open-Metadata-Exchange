#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from types import MappingProxyType

from server.plugins.mit_opencourseware.mit_opencourseware_models import MITOCWCourse
from server.plugins.ome_plugin import EducationResource, OMEPlugin


class MITOpenCourseWarePlugin(OMEPlugin):
    """Translate MIT OpenCourseWare course metadata into OME cards."""

    mimetypes: tuple[str, ...] = ("application/vnd.mit.opencourseware.course+json",)
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.mit_opencourseware": (
                "Metadata from MIT OpenCourseWare courses https://ocw.mit.edu"
            ),
        }
    )

    site_name: str = "MIT OpenCourseWare"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://ocw.mit.edu/favicon.ico"

    def make_metadata_card(self, course: MITOCWCourse) -> EducationResource:
        return EducationResource(
            title=course.title,
            description=course.description,
            authors=course.authors,
            authoring_institution=course.authoring_institution,
            subject_tags=course.subject_tags,
            source_url=course.source_url,
            version_url=course.version_url or course.source_url,
            spdx_license_expression=course.spdx_license_expression,
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an OME card from a normalized MIT OCW course dict."""
        return self.make_metadata_card(MITOCWCourse(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an OME card from a normalized MIT OCW course JSON payload."""
        return self.make_metadata_card(MITOCWCourse.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """Direct URL lookup is not supported for this plugin."""
        msg = (
            "Direct URL lookup is not supported. Use bulk_import.py to fetch MIT "
            "OpenCourseWare course metadata."
        )
        raise NotImplementedError(msg)


if __name__ == "__main__":
    from pathlib import Path

    plugin = MITOpenCourseWarePlugin()
    json_path = Path(__file__).parent / "mit_opencourseware_item.json"
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
