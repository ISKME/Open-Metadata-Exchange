#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

# OAPEN Library DSpace REST API response models.
# API docs: https://library.oapen.org/rest/

from types import MappingProxyType

from pydantic import BaseModel, Field, RootModel

# Map OAPEN dc.rights values (URLs and short strings) to SPDX expressions.
OAPEN_LICENSE_TO_SPDX: MappingProxyType[str, str] = MappingProxyType(
    {
        "https://creativecommons.org/licenses/by/4.0/": "CC-BY-4.0",
        "https://creativecommons.org/licenses/by/4.0": "CC-BY-4.0",
        "http://creativecommons.org/licenses/by/4.0/": "CC-BY-4.0",
        "http://creativecommons.org/licenses/by/4.0": "CC-BY-4.0",
        "https://creativecommons.org/licenses/by-sa/4.0/": "CC-BY-SA-4.0",
        "https://creativecommons.org/licenses/by-sa/4.0": "CC-BY-SA-4.0",
        "http://creativecommons.org/licenses/by-sa/4.0/": "CC-BY-SA-4.0",
        "https://creativecommons.org/licenses/by-nc/4.0/": "CC-BY-NC-4.0",
        "https://creativecommons.org/licenses/by-nc/4.0": "CC-BY-NC-4.0",
        "http://creativecommons.org/licenses/by-nc/4.0/": "CC-BY-NC-4.0",
        "https://creativecommons.org/licenses/by-nc-sa/4.0/": "CC-BY-NC-SA-4.0",
        "https://creativecommons.org/licenses/by-nc-sa/4.0": "CC-BY-NC-SA-4.0",
        "http://creativecommons.org/licenses/by-nc-sa/4.0/": "CC-BY-NC-SA-4.0",
        "https://creativecommons.org/licenses/by-nc-nd/4.0/": "CC-BY-NC-ND-4.0",
        "https://creativecommons.org/licenses/by-nc-nd/4.0": "CC-BY-NC-ND-4.0",
        "http://creativecommons.org/licenses/by-nc-nd/4.0/": "CC-BY-NC-ND-4.0",
        "https://creativecommons.org/licenses/by-nd/4.0/": "CC-BY-ND-4.0",
        "https://creativecommons.org/licenses/by-nd/4.0": "CC-BY-ND-4.0",
        "http://creativecommons.org/licenses/by-nd/4.0/": "CC-BY-ND-4.0",
        "cc by 4.0": "CC-BY-4.0",
        "cc-by 4.0": "CC-BY-4.0",
        "cc by-sa 4.0": "CC-BY-SA-4.0",
        "cc-by-sa 4.0": "CC-BY-SA-4.0",
        "cc by-nc 4.0": "CC-BY-NC-4.0",
        "cc-by-nc 4.0": "CC-BY-NC-4.0",
        "cc by-nc-sa 4.0": "CC-BY-NC-SA-4.0",
        "cc-by-nc-sa 4.0": "CC-BY-NC-SA-4.0",
        "cc by-nc-nd 4.0": "CC-BY-NC-ND-4.0",
        "cc-by-nc-nd 4.0": "CC-BY-NC-ND-4.0",
        "cc by-nd 4.0": "CC-BY-ND-4.0",
        "cc-by-nd 4.0": "CC-BY-ND-4.0",
        "cc0": "CC0-1.0",
        "cc0 1.0": "CC0-1.0",
        "https://creativecommons.org/publicdomain/zero/1.0/": "CC0-1.0",
    }
)

OAPEN_BASE_URL = "https://library.oapen.org"


class OapenMetadataEntry(BaseModel):
    """A single metadata field entry from the OAPEN DSpace REST API."""

    key: str = Field(description="Dublin Core metadata field name (e.g. 'dc.title').")
    value: str = Field(description="Field value.")
    language: str = Field(default="", description="BCP-47 language tag or empty string.")


class OapenItem(BaseModel):
    """
    A single item (book) record as returned by the OAPEN DSpace REST API.

    Endpoint: GET https://library.oapen.org/rest/search?query=<q>&expand=metadata
    """

    uuid: str = Field(description="OAPEN item UUID.")
    name: str = Field(default="", description="Item name (book title).")
    handle: str = Field(
        default="", description="DSpace handle, e.g. '20.500.12657/12345'."
    )
    type: str = Field(default="item", description="DSpace object type.")
    link: str = Field(default="", description="REST API link for this item.")
    lastModified: str = Field(  # noqa: N815
        default="", description="Last-modified timestamp string from the API."
    )
    metadata: list[OapenMetadataEntry] = Field(
        default_factory=list, description="Dublin Core metadata entries."
    )

    def get_metadata_values(self, key: str) -> list[str]:
        """Return all values for a given Dublin Core key."""
        return [m.value for m in self.metadata if m.key == key]

    def get_metadata_value(self, key: str, default: str = "") -> str:
        """Return the first value for a given Dublin Core key, or *default*."""
        values = self.get_metadata_values(key)
        return values[0] if values else default

    @property
    def source_url(self) -> str:
        """Return the canonical OAPEN handle URL for this item."""
        if uri := self.get_metadata_value("dc.identifier.uri"):
            return uri
        if self.handle:
            return f"{OAPEN_BASE_URL}/handle/{self.handle}"
        return ""

    @property
    def spdx_license(self) -> str:
        """Translate the dc.rights value to an SPDX expression."""
        raw = self.get_metadata_value("dc.rights")
        return OAPEN_LICENSE_TO_SPDX.get(raw.lower(), raw)


class OapenSearchResponse(RootModel[list[OapenItem]]):
    """Root model for the OAPEN DSpace REST API search response (a JSON array)."""


if __name__ == "__main__":
    from pathlib import Path

    here = Path(__file__).parent
    item = OapenItem.model_validate_json((here / "oapen_item.json").read_text())
    print(f"{item.name = }")
    print(f"{item.handle = }")
    print(f"{item.source_url = }")
    print(f"{item.spdx_license = }")
    print(f"{item.get_metadata_values('dc.contributor.author') = }")
    print(f"{item.get_metadata_values('dc.subject') = }")
