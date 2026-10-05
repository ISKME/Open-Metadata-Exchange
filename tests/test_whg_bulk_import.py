import json
from pathlib import Path

from server.plugins.whg.bulk_import import bulk_import, bulk_translate

WHG_DIR = Path(__file__).parent.parent / "server" / "plugins" / "whg"


def test_bulk_import_uses_cache() -> None:
    """bulk_import reads from the cached whg.json file without hitting the network."""
    results = bulk_import(cache_path=WHG_DIR / "whg.json")
    assert isinstance(results, list)
    assert len(results) > 0


def test_bulk_import_returns_dicts() -> None:
    """Each result from bulk_import is a serialised EducationResource dict."""
    results = bulk_import(cache_path=WHG_DIR / "whg.json")
    first = results[0]
    assert isinstance(first, dict)
    assert "title" in first
    assert "authors" in first
    assert "subject_tags" in first


def test_bulk_import_first_record_values() -> None:
    """The first cached WHG dataset maps to the expected EducationResource fields."""
    results = bulk_import(cache_path=WHG_DIR / "whg.json")
    first = results[0]
    assert first["title"] == "African Ports, 1887"
    assert first["authoring_institution"] == "WHG Admin"


def test_bulk_translate_from_json_fixture() -> None:
    """bulk_translate yields EducationResource cards from raw WHG feature dicts."""
    payload = json.loads((WHG_DIR / "whg.json").read_text())
    features = payload.get("features", [])
    cards = list(bulk_translate(features))
    assert len(cards) == len(features)
    assert cards[0].title == "African Ports, 1887"


def test_bulk_translate_single_item() -> None:
    """bulk_translate correctly converts a single raw feature dict."""
    raw = json.loads((WHG_DIR / "whg_item.json").read_text())
    cards = list(bulk_translate([raw]))
    assert len(cards) == 1
    assert cards[0].title == "African Ports, 1887"
    assert cards[0].authoring_institution == "WHG Admin"
