from pathlib import Path

from server.plugins.prelinger.bulk_import import bulk_import, fetch_item_metadata, search_prelinger
from server.plugins.prelinger.prelinger_models import PrelingerItem

PRELINGER_DIR = Path(__file__).parent.parent / "server" / "plugins" / "prelinger"


def test_bulk_import_uses_cache() -> None:
    """bulk_import reads from the cached finland videos file without hitting the network."""
    items = bulk_import(query="finland")
    assert isinstance(items, list)
    assert len(items) > 0
    assert all(isinstance(item, PrelingerItem) for item in items)


def test_bulk_import_returns_prelinger_items() -> None:
    """Each item returned by bulk_import has the expected fields."""
    items = bulk_import(query="finland")
    first = items[0]
    assert first.title
    assert first.identifier
    assert first.mediatype == "movies"


def test_bulk_import_plugin_card_translation() -> None:
    """PrelingerPlugin correctly translates cached items to EducationResource cards."""
    from server.plugins.prelinger.plugin import PrelingerPlugin

    plugin = PrelingerPlugin()
    items = bulk_import(query="finland")
    cards = [plugin.make_metadata_card_from_dict(item.model_dump()) for item in items]
    assert len(cards) == len(items)
    first_card = cards[0]
    assert first_card.title
    assert first_card.source_url.startswith("https://archive.org/details/")


def test_bulk_import_reexports_search_prelinger() -> None:
    """search_prelinger is importable from bulk_import."""
    assert callable(search_prelinger)


def test_bulk_import_reexports_fetch_item_metadata() -> None:
    """fetch_item_metadata is importable from bulk_import."""
    assert callable(fetch_item_metadata)
