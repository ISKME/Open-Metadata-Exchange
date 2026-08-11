#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

import re
from datetime import UTC, datetime
from types import MappingProxyType

from server.plugins.oer_africa.oer_africa_models import OERAFricaResource
from server.plugins.ome_plugin import EducationResource, OMEPlugin

# Mapping from OER Africa license strings to SPDX expressions
_LICENSE_MAP: dict[str, str] = MappingProxyType(
    {
        "cc by 4.0": "CC-BY-4.0",
        "cc by-sa 4.0": "CC-BY-SA-4.0",
        "cc by-nc 4.0": "CC-BY-NC-4.0",
        "cc by-nc-sa 4.0": "CC-BY-NC-SA-4.0",
        "cc by-nd 4.0": "CC-BY-ND-4.0",
        "cc by-nc-nd 4.0": "CC-BY-NC-ND-4.0",
        "cc0": "CC0-1.0",
        "public domain": "CC0-1.0",
    }
)

_HTML_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(text: str) -> str:
    return _HTML_TAG_RE.sub("", text).strip()


def _parse_datetime(value: str) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _normalise_license(raw: str) -> str:
    return _LICENSE_MAP.get(raw.strip().lower(), raw.strip())


class OERAFricaPlugin(OMEPlugin):
    """
    Plugin for OER Africa — a continental repository of open educational resources
    hosted at https://www.oerafrica.org.

    Metadata is sourced from the Drupal JSON:API endpoint:
      https://www.oerafrica.org/jsonapi/node/resource
    Resources can be searched at:
      https://www.oerafrica.org/search/site
    """

    mimetypes: tuple[str, ...] = ("application/vnd.oer-africa.resource+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.oer_africa": (
                "Metadata from OER Africa open educational resources "
                "https://www.oerafrica.org"
            ),
        }
    )

    site_name: str = "OER Africa"
    librarian_contact: str = "info@oerafrica.org"
    logo: str = "https://www.oerafrica.org/sites/default/files/oerafrica-logo.png"

    def make_metadata_card(self, resource: OERAFricaResource) -> EducationResource:
        attrs = resource.attributes
        body_summary = attrs.body.summary or _strip_html(attrs.body.value)
        source_url = attrs.field_url or (
            f"https://www.oerafrica.org/node/{attrs.drupal_internal__nid}"
            if attrs.drupal_internal__nid
            else ""
        )
        return EducationResource(
            title=attrs.title,
            description=body_summary,
            authors=resource.meta.field_authors_names,
            authoring_institution=resource.meta.field_institution_title,
            subject_tags=attrs.field_subjects,
            creation_date=_parse_datetime(attrs.created),
            last_modified_date=_parse_datetime(attrs.changed),
            source_url=source_url,
            spdx_license_expression=_normalise_license(attrs.field_license),
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create a metadata card from a dict representing one OER Africa resource."""
        return self.make_metadata_card(OERAFricaResource(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create a metadata card from a JSON string for one OER Africa resource."""
        return self.make_metadata_card(
            OERAFricaResource.model_validate_json(json_payload)
        )

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        Fetch a single OER Africa resource page and return its metadata card.

        The URL should be of the form:
          https://www.oerafrica.org/node/<nid>?_format=json
        or the canonical resource URL.
        """
        import httpx

        json_url = url if "_format=json" in url else f"{url.rstrip('/')}?_format=json"
        with httpx.Client() as httpx_client:
            response = httpx_client.get(json_url).raise_for_status()
        return self.make_metadata_card_from_json(response.text)


if __name__ == "__main__":
    from pathlib import Path

    json_path = Path(__file__).parent / "oer_africa_item.json"
    plugin = OERAFricaPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")
    card = plugin.make_metadata_card_from_json(json_path.read_text())
    print(f"{card = }")
    print(f"{card.title = }")
    print(f"{card.authors = }")
    print(f"{card.authoring_institution = }")
    print(f"{card.subject_tags = }")
    print(f"{card.spdx_license_expression = }")
    print(f"{card.creation_date = }")
    print(f"UTC creation: {card.creation_date.astimezone(UTC) if card.creation_date else None}")
