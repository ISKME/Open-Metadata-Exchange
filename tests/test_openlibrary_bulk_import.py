from pathlib import Path

from server.plugins.openlibrary.bulk_import import bulk_translate

OPENLIBRARY_DIR = Path(__file__).parent.parent / "server" / "plugins" / "openlibrary"


def _sample_book_dict() -> dict:
    """Return a minimal Open Library search-result dict for testing."""
    return {
        "title": "The Return of Sherlock Holmes",
        "key": "/works/OL262477W",
        "author_name": ["Arthur Conan Doyle"],
        "subject": ["Detective fiction", "Fiction"],
        "first_publish_year": 1905,
    }


def test_bulk_translate_single_item() -> None:
    """bulk_translate yields an EducationResource card from a raw search-result dict."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert len(cards) == 1
    card = cards[0]
    assert card.title == "The Return of Sherlock Holmes"
    assert card.authors == ["Arthur Conan Doyle"]


def test_bulk_translate_sets_source_url() -> None:
    """bulk_translate constructs the source_url from the Open Library key."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert cards[0].source_url == "https://openlibrary.org/works/OL262477W"


def test_bulk_translate_sets_authoring_institution() -> None:
    """bulk_translate sets authoring_institution to the Open Library attribution string."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert "openlibrary.org" in cards[0].authoring_institution


def test_bulk_translate_sets_subject_tags() -> None:
    """bulk_translate maps subject to subject_tags."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert "Detective fiction" in cards[0].subject_tags


def test_bulk_translate_skips_items_without_title() -> None:
    """bulk_translate silently skips dicts that have no title."""
    no_title = {"key": "/works/OL1234W", "author_name": ["Unknown"]}
    cards = list(bulk_translate([no_title]))
    assert cards == []


def test_bulk_translate_multiple_items() -> None:
    """bulk_translate yields one card per valid item in the list."""
    books = [_sample_book_dict(), _sample_book_dict()]
    cards = list(bulk_translate(books))
    assert len(cards) == 2


def test_bulk_translate_from_work_json() -> None:
    """bulk_translate handles a dict derived from the sample openlibrary_work.json fixture."""
    # The work JSON has different shape than search results — we test that the
    # translate function handles it gracefully (title present → card yielded).
    import json

    work = json.loads((OPENLIBRARY_DIR / "openlibrary_work.json").read_text())
    # Adapt work-format dict to search-result format expected by bulk_translate
    adapted = {
        "title": work["title"],
        "key": work["key"],
        "author_name": [],
        "subject": work.get("subjects", []),
    }
    cards = list(bulk_translate([adapted]))
    assert len(cards) == 1
    assert cards[0].title == "The Return of Sherlock Holmes"
