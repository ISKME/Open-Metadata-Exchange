import json
from pathlib import Path

from server.plugins.oercommons.bulk_import import bulk_translate

OERCOMMONS_DIR = Path(__file__).parent.parent / "server" / "plugins" / "oercommons"


def _load_hit_dict() -> dict:
    """Load the sample oercommons.json fixture as a raw hit dict (full Model format)."""
    return json.loads((OERCOMMONS_DIR / "oercommons.json").read_text())


def test_bulk_translate_single_item() -> None:
    """bulk_translate yields a card from a raw Model-format hit dict."""
    hit = _load_hit_dict()
    cards = list(bulk_translate([hit]))
    assert len(cards) == 1
    card = cards[0]
    assert card.title == "Basic Analysis: Introduction to Real Analysis"
    assert "Jiří Lebl" in card.authors


def test_bulk_translate_sets_authoring_institution() -> None:
    """bulk_translate maps provider_name to authoring_institution."""
    hit = _load_hit_dict()
    cards = list(bulk_translate([hit]))
    assert cards[0].authoring_institution == hit["_source"]["provider_name"]


def test_bulk_translate_sets_subject_tags() -> None:
    """bulk_translate maps keywords_names to subject_tags."""
    hit = _load_hit_dict()
    cards = list(bulk_translate([hit]))
    assert cards[0].subject_tags == hit["_source"]["keywords_names"]


def test_bulk_translate_skips_invalid_items() -> None:
    """bulk_translate silently skips dicts that cannot be validated."""
    bad_item = {"not_a_real_field": 42}
    cards = list(bulk_translate([bad_item]))
    assert cards == []


def test_bulk_translate_multiple_items() -> None:
    """bulk_translate handles a list of multiple items."""
    hit = _load_hit_dict()
    cards = list(bulk_translate([hit, hit]))
    assert len(cards) == 2
    assert all(
        card.title == "Basic Analysis: Introduction to Real Analysis" for card in cards
    )
