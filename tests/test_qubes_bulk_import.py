import json
from pathlib import Path

import pytest

from server.plugins.qubes.bulk_import import bulk_import, bulk_translate

QUBES_DIR = Path(__file__).parent.parent / "server" / "plugins" / "qubes"


_SAMPLE_RECORD = {
    "identifier": "https://qubeshub.org/publications/1/1",
    "setSpec": "publications",
    "title": "DataNuggets Resources",
    "creator": ["Drew LaMar"],
    "subject": ["Biology", "DataNuggets"],
    "date": "2016-02-18T04:13:55Z",
    "description": "A collection of DataNuggets classroom resources.",
    "type": "text",
    "rights": "https://creativecommons.org/licenses/by/4.0/",
}


def test_bulk_translate_single_record() -> None:
    """bulk_translate yields an EducationResource card from a single raw record dict."""
    cards = list(bulk_translate([_SAMPLE_RECORD]))
    assert len(cards) == 1
    card = cards[0]
    assert card.title == "DataNuggets Resources"


def test_bulk_translate_sets_authors() -> None:
    """bulk_translate maps creator to authors."""
    cards = list(bulk_translate([_SAMPLE_RECORD]))
    assert "Drew LaMar" in cards[0].authors


def test_bulk_translate_multiple_records() -> None:
    """bulk_translate yields one card per valid record."""
    records = [_SAMPLE_RECORD, _SAMPLE_RECORD]
    cards = list(bulk_translate(records))
    assert len(cards) == 2


def test_bulk_import_from_cache(tmp_path: Path) -> None:
    """bulk_import reads from a cached JSON file and returns serialised OME records."""
    cache = tmp_path / "qubes_records.json"
    cache.write_text(json.dumps([_SAMPLE_RECORD]))

    results = bulk_import(cache_path=cache)
    assert isinstance(results, list)
    assert len(results) == 1
    assert results[0]["title"] == "DataNuggets Resources"


def test_bulk_import_raises_if_no_cache(tmp_path: Path) -> None:
    """bulk_import raises FileNotFoundError when the cache file does not exist."""
    missing = tmp_path / "qubes_records.json"
    with pytest.raises(FileNotFoundError):
        bulk_import(cache_path=missing)


def test_bulk_import_multiple_records_from_cache(tmp_path: Path) -> None:
    """bulk_import handles multiple records correctly."""
    record2 = {
        **_SAMPLE_RECORD,
        "title": "Second Resource",
        "identifier": "https://qubeshub.org/publications/2/1",
    }
    cache = tmp_path / "qubes_records.json"
    cache.write_text(json.dumps([_SAMPLE_RECORD, record2]))

    results = bulk_import(cache_path=cache)
    assert len(results) == 2
    titles = [r["title"] for r in results]
    assert "DataNuggets Resources" in titles
    assert "Second Resource" in titles
