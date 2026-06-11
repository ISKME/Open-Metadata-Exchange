import json
from pathlib import Path

from server.plugins.project_gutenberg.bulk_import import bulk_translate
from server.plugins.project_gutenberg.gutenberg_models import (
    GutenbergBook,
    GutenbergSearchResponse,
)
from server.plugins.project_gutenberg.plugin import ProjectGutenbergPlugin

GUTENBERG_DIR = (
    Path(__file__).parent.parent / "server" / "plugins" / "project_gutenberg"
)


def _sample_book_dict() -> dict:
    """Return a minimal Gutendex book dict for testing."""
    return {
        "id": 1661,
        "title": "The Adventures of Sherlock Holmes",
        "authors": [{"name": "Doyle, Arthur Conan", "birth_year": 1859, "death_year": 1930}],
        "subjects": [
            "Detective and mystery stories, English",
            "Holmes, Sherlock (Fictitious character) -- Fiction",
        ],
        "bookshelves": ["Mystery Fiction"],
        "languages": ["en"],
        "copyright": False,
        "media_type": "Text",
        "formats": {},
        "download_count": 99654,
    }


def test_bulk_translate_single_item() -> None:
    """bulk_translate yields an EducationResource card from a raw book dict."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert len(cards) == 1
    card = cards[0]
    assert card.title == "The Adventures of Sherlock Holmes"
    assert card.authors == ["Arthur Conan Doyle"]


def test_bulk_translate_sets_source_url() -> None:
    """bulk_translate constructs the source_url from the Gutenberg book id."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert cards[0].source_url == "https://www.gutenberg.org/ebooks/1661"


def test_bulk_translate_sets_authoring_institution() -> None:
    """bulk_translate sets authoring_institution to Project Gutenberg."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert "Project Gutenberg" in cards[0].authoring_institution


def test_bulk_translate_sets_subject_tags() -> None:
    """bulk_translate maps subjects and bookshelves to subject_tags."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert "Detective and mystery stories, English" in cards[0].subject_tags
    assert "Mystery Fiction" in cards[0].subject_tags


def test_bulk_translate_sets_public_domain_license() -> None:
    """bulk_translate sets spdx_license_expression to public-domain."""
    cards = list(bulk_translate([_sample_book_dict()]))
    assert cards[0].spdx_license_expression == "LicenseRef-public-domain"


def test_bulk_translate_multiple_items() -> None:
    """bulk_translate yields one card per item in the list."""
    books = [_sample_book_dict(), _sample_book_dict()]
    cards = list(bulk_translate(books))
    assert len(cards) == 2


def test_author_name_inversion() -> None:
    """Author names in 'Last, First' format are converted to 'First Last'."""
    book = GutenbergBook(**_sample_book_dict())
    assert book.author_names == ["Arthur Conan Doyle"]


def test_author_name_no_comma() -> None:
    """Author names without a comma are returned unchanged."""
    data = _sample_book_dict()
    data["authors"] = [{"name": "Anonymous"}]
    book = GutenbergBook(**data)
    assert book.author_names == ["Anonymous"]


def test_plugin_make_metadata_card_from_json() -> None:
    """make_metadata_card_from_json produces a valid card from the fixture JSON."""
    plugin = ProjectGutenbergPlugin()
    json_path = GUTENBERG_DIR / "gutenberg_item.json"
    card = plugin.make_metadata_card_from_json(json_path.read_text())
    assert card.title == "The Adventures of Sherlock Holmes"
    assert card.authors == ["Arthur Conan Doyle"]
    assert card.source_url == "https://www.gutenberg.org/ebooks/1661"


def test_plugin_make_metadata_cards_from_search_json() -> None:
    """make_metadata_cards_from_search_json returns one card per search result."""
    plugin = ProjectGutenbergPlugin()
    json_path = GUTENBERG_DIR / "gutenberg_search.json"
    cards = plugin.make_metadata_cards_from_search_json(json_path.read_text())
    assert len(cards) == 5
    titles = [c.title for c in cards]
    assert "The Adventures of Sherlock Holmes" in titles
    assert "The Hound of the Baskervilles" in titles


def test_gutenberg_search_response_from_fixture() -> None:
    """GutenbergSearchResponse parses the search fixture correctly."""
    json_path = GUTENBERG_DIR / "gutenberg_search.json"
    search = GutenbergSearchResponse.model_validate_json(json_path.read_text())
    assert search.count == 5
    assert len(search.results) == 5
    assert search.results[0].id == 1661


def test_bulk_translate_from_search_fixture() -> None:
    """bulk_translate handles dicts from the gutenberg_search.json fixture."""
    json_path = GUTENBERG_DIR / "gutenberg_search.json"
    search = json.loads(json_path.read_text())
    cards = list(bulk_translate(search["results"]))
    assert len(cards) == 5
    assert cards[1].title == "The Hound of the Baskervilles"
