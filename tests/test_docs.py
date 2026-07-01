"""Tests that verify each OME plugin has a documentation page at GitHub Pages.

Uses httpx to check https://iskme.github.io/Open-Metadata-Exchange for
a page for each plugin in the server/plugins directory.
"""

from pathlib import Path

import httpx
import pytest

PLUGINS_DIR = Path(__file__).resolve().parent.parent / "server" / "plugins"
DOCS_BASE_URL = "https://iskme.github.io/Open-Metadata-Exchange"


def _plugin_names() -> list[str]:
    """Return sorted list of plugin directory names (excluding non-plugin entries)."""
    return sorted(
        path.name
        for path in PLUGINS_DIR.iterdir()
        if path.is_dir() and not path.name.startswith("_")
    )


@pytest.mark.parametrize("plugin_name", _plugin_names())
def test_plugin_docs_page_exists(plugin_name: str) -> None:
    """Each plugin must have a documentation page on GitHub Pages."""
    url = f"{DOCS_BASE_URL}/server/plugins/{plugin_name}/README.html"
    response = httpx.get(url, follow_redirects=True)
    assert response.status_code == 200, (
        f"Expected docs page for plugin {plugin_name!r} at {url} "
        f"but got HTTP {response.status_code}"
    )


def test_docs_index_exists() -> None:
    """The documentation index page must exist on GitHub Pages."""
    url = f"{DOCS_BASE_URL}/index.html"
    response = httpx.get(url, follow_redirects=True)
    assert response.status_code == 200, (
        f"Expected docs index at {url} but got HTTP {response.status_code}"
    )


def test_docs_plugins_overview_exists() -> None:
    """The plugins overview page must exist on GitHub Pages."""
    url = f"{DOCS_BASE_URL}/server/plugins/README.html"
    response = httpx.get(url, follow_redirects=True)
    assert response.status_code == 200, (
        f"Expected plugins overview at {url} but got HTTP {response.status_code}"
    )
