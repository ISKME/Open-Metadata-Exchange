import json
from pathlib import Path

from server.plugins.oercommons.bulk_import import bulk_translate
from server.plugins.oercommons.oercommons_models import FieldSource

OERCOMMONS_DIR = Path(__file__).parent.parent / "server" / "plugins" / "oercommons"


def _load_field_source() -> FieldSource:
    """Load the sample oercommons.json fixture and return its _source object."""
    from server.plugins.oercommons.oercommons_models import Model

    model = Model.model_validate_json((OERCOMMONS_DIR / "oercommons.json").read_text())
    return model.field_source


def test_bulk_translate_single_item() -> None:
    """bulk_translate yields an EducationResource card from a raw FieldSource dict."""
    source = _load_field_source()
    cards = list(bulk_translate([source.model_dump()]))
    assert len(cards) == 1
    card = cards[0]
    assert card.title == "Basic Analysis: Introduction to Real Analysis"
    assert "Jiří Lebl" in card.authors


def test_bulk_translate_sets_authoring_institution() -> None:
    """bulk_translate maps provider_name to authoring_institution."""
    source = _load_field_source()
    cards = list(bulk_translate([source.model_dump()]))
    assert cards[0].authoring_institution == source.provider_name


def test_bulk_translate_sets_subject_tags() -> None:
    """bulk_translate maps keywords_names to subject_tags."""
    source = _load_field_source()
    cards = list(bulk_translate([source.model_dump()]))
    assert cards[0].subject_tags == source.keywords_names


def test_bulk_translate_skips_invalid_items() -> None:
    """bulk_translate silently skips dicts that cannot be validated."""
    bad_item = {"not_a_real_field": 42}
    cards = list(bulk_translate([bad_item]))
    assert cards == []


def test_bulk_translate_multiple_items() -> None:
    """bulk_translate handles a list of multiple items."""
    source = _load_field_source()
    raw = source.model_dump()
    cards = list(bulk_translate([raw, raw]))
    assert len(cards) == 2
    assert all(card.title == "Basic Analysis: Introduction to Real Analysis" for card in cards)
