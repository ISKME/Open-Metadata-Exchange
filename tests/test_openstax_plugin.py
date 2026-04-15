import json
from pathlib import Path

import pytest

from server.plugins.openstax.openstax_models import OpenStaxBook
from server.plugins.openstax.plugin import OpenStaxPlugin

OPENSTAX_DIR = Path(__file__).parent.parent / "server" / "plugins" / "openstax"


def test_openstax_model_from_json() -> None:
    """OpenStaxBook parses the sample item fixture."""
    book = OpenStaxBook.model_validate_json((OPENSTAX_DIR / "openstax_item.json").read_text())
    assert book.title == "Introduction to Python Programming"
    assert book.authors == ["OpenStax"]
    assert "computer science" in book.subject_tags


def test_openstax_plugin_attributes() -> None:
    """OpenStaxPlugin exposes expected mimetype and newsgroup metadata."""
    plugin = OpenStaxPlugin()
    assert plugin.mimetypes == ("application/vnd.openstax.book+json",)
    assert "ome.openstax" in plugin.newsgroups
    assert "openstax.org/subjects/computer-science" in plugin.newsgroups["ome.openstax"]


def test_make_metadata_card_from_json() -> None:
    """make_metadata_card_from_json converts OpenStax fixture to EducationResource."""
    plugin = OpenStaxPlugin()
    card = plugin.make_metadata_card_from_json((OPENSTAX_DIR / "openstax_item.json").read_text())
    assert card.title == "Introduction to Python Programming"
    assert card.authoring_institution == "OpenStax"
    assert card.source_url == "https://openstax.org/details/books/introduction-python-programming"
    assert card.spdx_license_expression == "CC-BY-4.0"


def test_make_metadata_card_from_url_not_implemented() -> None:
    """make_metadata_card_from_url raises NotImplementedError."""
    plugin = OpenStaxPlugin()
    with pytest.raises(NotImplementedError):
        plugin.make_metadata_card_from_url("https://openstax.org/details/books/example")


def test_sample_dataset_is_list_of_books() -> None:
    """Computer science sample dataset fixture is a non-empty list of valid books."""
    books = json.loads((OPENSTAX_DIR / "openstax_computer_science_books.json").read_text())
    assert isinstance(books, list)
    assert books
    parsed_books = [OpenStaxBook(**book) for book in books]
    assert any(book.title == "Introduction to Python Programming" for book in parsed_books)
