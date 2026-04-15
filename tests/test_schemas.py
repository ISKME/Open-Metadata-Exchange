import json

import pytest
from pydantic import ValidationError

from server.schemas import Metadata, SPDX_LICENSES_JSON, spdx_id_to_full_name

with SPDX_LICENSES_JSON.open(encoding="utf-8") as spdx_file:
    SPDX_LICENSE_IDS = {
        license_info["licenseId"] for license_info in json.load(spdx_file)["licenses"]
    }


@pytest.mark.parametrize(
    ("spdx_license_id", "is_valid"),
    [
        ("MIT", True),
        ("Apache-2.0", True),
        ("CC-BY-4.0", True),
        ("NOT-A-REAL-SPDX-ID", False),
    ],
)
def test_spdx_id_to_full_name(spdx_license_id: str, is_valid: bool) -> None:
    if is_valid:
        assert spdx_id_to_full_name(spdx_license_id)
        return
    with pytest.raises(ValueError, match="Invalid SPDX license identifier"):
        spdx_id_to_full_name(spdx_license_id)


@pytest.mark.parametrize(
    "spdx_license",
    [
        "MIT",
        "Apache-2.0",
        "CC-BY-4.0",
        "NOT-A-REAL-SPDX-ID",
    ],
)
def test_spdx_license(spdx_license: str) -> None:
    if spdx_license in SPDX_LICENSE_IDS:
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
        assert metadata.spdx_license == spdx_license
        return
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
