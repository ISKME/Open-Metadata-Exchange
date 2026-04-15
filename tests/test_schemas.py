import json

import pytest
from pydantic import ValidationError

from server.schemas import SPDX_LICENSES_JSON, Metadata, spdx_id_to_full_name

with SPDX_LICENSES_JSON.open(encoding="utf-8") as spdx_file:
    SPDX_LICENSE_IDS = {
        license_info["licenseId"] for license_info in json.load(spdx_file)["licenses"]
    }


@pytest.mark.parametrize(
    ("spdx_license_id", "expected_full_name"),
    [
        ("MIT", "MIT License"),
        ("Apache-2.0", "Apache License 2.0"),
        ("CC-BY-4.0", "Creative Commons Attribution 4.0 International"),
    ],
)
def test_spdx_id_to_full_name(spdx_license_id: str, expected_full_name: str) -> None:
    assert spdx_id_to_full_name(spdx_license_id) == expected_full_name


@pytest.mark.parametrize("spdx_license_id", ["NOT-A-REAL-SPDX-ID"])
def test_spdx_id_to_full_name_invalid(spdx_license_id: str) -> None:
    with pytest.raises(ValueError, match="Invalid SPDX license identifier"):
        spdx_id_to_full_name(spdx_license_id)


@pytest.mark.parametrize(
    "spdx_license",
    [
        "MIT",
        "Apache-2.0",
        "CC-BY-4.0",
    ],
)
def test_spdx_license(spdx_license: str) -> None:
    metadata = Metadata(
        title="Title",
        url="https://example.org/resource",
        description="Description",
        subject="Subject",
        author="Author",
        spdx_license=spdx_license,
        alignment_tags=[],
        keywords=[],
    )
    assert spdx_license in SPDX_LICENSE_IDS
    assert metadata.spdx_license == spdx_license


@pytest.mark.parametrize("spdx_license", ["NOT-A-REAL-SPDX-ID"])
def test_spdx_license_invalid(spdx_license: str) -> None:
    with pytest.raises(ValidationError):
        Metadata(
            title="Title",
            url="https://example.org/resource",
            description="Description",
            subject="Subject",
            author="Author",
            spdx_license=spdx_license,
            alignment_tags=[],
            keywords=[],
        )
