#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from contextlib import suppress
from datetime import datetime
from types import MappingProxyType

import httpx

from server.plugins.ome_plugin import EducationResource, OMEPlugin
from server.plugins.prelinger.prelinger_models import (
    PrelingerItem,
    PrelingerMetadataResponse,
)

ARCHIVE_DETAILS_BASE = "https://archive.org/details/"

# Map each strptime format to the expected number of characters in the date string.
# Using explicit lengths avoids the pitfall of len("%Y") == 2 while a year is 4 chars.
_IA_DATE_FORMATS: tuple[tuple[str, int], ...] = (
    ("%Y-%m-%d", 10),
    ("%Y-%m", 7),
    ("%Y", 4),
)


def _parse_ia_date(date_str: str) -> datetime | None:
    """Parse an Internet Archive date string (YYYY, YYYY-MM, or YYYY-MM-DD)."""
    for fmt, length in _IA_DATE_FORMATS:
        with suppress(ValueError):
            return datetime.strptime(date_str[:length], fmt)  # noqa: DTZ007
    return None


class PrelingerPlugin(OMEPlugin):
    """
    Plugin for Prelinger Archives videos hosted at the Internet Archive.

    Translates metadata obtained via the Internet Archive Metadata API
    (https://archive.org/developers/md-read.html) into standardised
    OME EducationResource cards.

    The Prelinger Archives is a collection of ephemeral films - advertising,
    educational, industrial, and amateur - donated to the Internet Archive
    and made freely available in the public domain.
    """

    mimetypes: tuple[str, ...] = ("application/vnd.prelinger.video+json",)
    # newsgroups is a dict but make it immutable for safety reasons. `ruff rule RUF012`
    newsgroups: dict[str, str] = MappingProxyType(
        {
            "ome.prelinger": (
                "Metadata from Prelinger Videos at the Internet Archive "
                "https://archive.org/details/prelinger"
            ),
        }
    )

    site_name: str = "Prelinger Archives"
    librarian_contact: str = "info@iskme.org"
    logo: str = "https://archive.org/images/glogo.png"

    def _make_metadata_card(self, item: PrelingerItem) -> EducationResource:
        source_url = (
            f"{ARCHIVE_DETAILS_BASE}{item.identifier}" if item.identifier else ""
        )
        parsed_date = _parse_ia_date(item.date) if item.date else None
        return EducationResource(
            title=item.title,
            description=item.description,
            authors=item.creator,
            authoring_institution="Internet Archive / Prelinger Archives",
            subject_tags=item.subject,
            creation_date=parsed_date,
            last_modified_date=parsed_date,
            source_url=source_url,
            version_url=source_url,
            spdx_license_expression=item.licenseurl,
        )

    def make_metadata_card_from_dict(self, doc_dict: dict) -> EducationResource:
        """Create an EducationResource from a plain Python dict."""
        return self._make_metadata_card(PrelingerItem(**doc_dict))

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Create an EducationResource from a raw JSON string."""
        return self._make_metadata_card(PrelingerItem.model_validate_json(json_payload))

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        Create an EducationResource by fetching the Internet Archive Metadata API.

        Calls ``GET https://archive.org/metadata/{identifier}`` where
        *identifier* is extracted from the supplied *url*.
        """
        with httpx.Client(follow_redirects=True, timeout=30.0) as client:
            # Accept both https://archive.org/details/{id} and
            # https://archive.org/metadata/{id}
            identifier = url.rstrip("/").rsplit("/", 1)[-1]
            api_url = f"https://archive.org/metadata/{identifier}"
            response = client.get(api_url).raise_for_status()
        envelope = PrelingerMetadataResponse.model_validate_json(response.text)
        return self._make_metadata_card(envelope.metadata)


if __name__ == "__main__":
    from pathlib import Path

    plugin = PrelingerPlugin()
    print(f"{plugin = }")
    print(f"{plugin.mimetypes = }")
    print(f"{plugin.newsgroups = }\n")

    json_path = Path(__file__).parent / "prelinger_item.json"
    print(f"{plugin.make_metadata_card_from_json(json_path.read_text()) = }")
