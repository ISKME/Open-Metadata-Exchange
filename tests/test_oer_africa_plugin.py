import json
from pathlib import Path

import httpx
import pytest

from server.plugins.oer_africa.oer_africa_models import OERAFricaResource
from server.plugins.oer_africa.plugin import (
    OERAFricaPlugin,
    _normalise_license,
    _strip_html,
)

OER_AFRICA_DIR = Path(__file__).parent.parent / "server" / "plugins" / "oer_africa"


def test_oer_africa_model_from_json() -> None:
    """OERAFricaResource parses the sample item fixture."""
    resource = OERAFricaResource.model_validate_json(
        (OER_AFRICA_DIR / "oer_africa_item.json").read_text()
    )
    assert "Milk" in resource.attributes.title
    assert resource.attributes.field_license == "CC BY 4.0"
    assert "Agriculture" in resource.attributes.field_subjects
    assert resource.meta.field_authors_names


def test_oer_africa_plugin_attributes() -> None:
    """OERAFricaPlugin exposes expected mimetype and newsgroup metadata."""
    plugin = OERAFricaPlugin()
    assert plugin.mimetypes == ("application/vnd.oer-africa.resource+json",)
    assert "ome.oer_africa" in plugin.newsgroups
    assert plugin.newsgroups["ome.oer_africa"].startswith(
        "Metadata from OER Africa open educational resources "
    )


def test_make_metadata_card_from_json() -> None:
    """make_metadata_card_from_json converts OER Africa fixture to EducationResource."""
    plugin = OERAFricaPlugin()
    card = plugin.make_metadata_card_from_json(
        (OER_AFRICA_DIR / "oer_africa_item.json").read_text()
    )
    assert "Milk" in card.title
    assert card.authoring_institution
    assert card.spdx_license_expression == "CC-BY-4.0"
    assert card.creation_date is not None
    assert card.last_modified_date is not None
    assert card.source_url.startswith("https://")


def test_make_metadata_card_from_url_not_implemented_raises() -> None:
    """make_metadata_card_from_url raises httpx.ConnectError on an invalid hostname."""
    plugin = OERAFricaPlugin()
    with pytest.raises(httpx.ConnectError):
        plugin.make_metadata_card_from_url(
            "https://www.oerafrica.invalid/node/99999999"
        )


def test_sample_dataset_is_list_of_resources() -> None:
    """Milk sample dataset fixture is a non-empty list of valid OER Africa resources."""
    resources = json.loads((OER_AFRICA_DIR / "oer_africa_milk_books.json").read_text())
    assert isinstance(resources, list)
    assert resources
    parsed = [OERAFricaResource(**r) for r in resources]
    assert all(r.type == "node--resource" for r in parsed)
    titles = [r.attributes.title for r in parsed]
    assert any("Milk" in t or "milk" in t.lower() for t in titles)


def test_bulk_translate_sample_dataset() -> None:
    """All five milk-book fixtures can be translated to EducationResource cards."""
    plugin = OERAFricaPlugin()
    resources = json.loads((OER_AFRICA_DIR / "oer_africa_milk_books.json").read_text())
    cards = [plugin.make_metadata_card_from_dict(r) for r in resources]
    assert len(cards) == 5
    for card in cards:
        assert card.title
        assert card.source_url.startswith("https://")


def test_license_normalisation() -> None:
    """_normalise_license maps known strings to SPDX identifiers."""
    assert _normalise_license("CC BY 4.0") == "CC-BY-4.0"
    assert _normalise_license("CC BY-SA 4.0") == "CC-BY-SA-4.0"
    assert _normalise_license("CC BY-NC 4.0") == "CC-BY-NC-4.0"
    assert _normalise_license("CC0") == "CC0-1.0"
    assert _normalise_license("Unknown License") == "Unknown License"


def test_strip_html() -> None:
    """_strip_html removes HTML tags from body text."""
    assert _strip_html("<p>Hello <b>world</b></p>") == "Hello world"
    assert _strip_html("plain text") == "plain text"
    assert _strip_html("") == ""
