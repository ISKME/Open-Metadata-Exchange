"""Issue #8 — formalize the plugin interface.

Covers:

* ``OMEPlugin.plugin_api_version`` exists and has a sensible default.
* ``validate_plugin()`` accepts compatible plugins, rejects missing or
  incompatible versions with ``InvalidPluginError``.
* ``OMEPluginProtocol`` (``typing.Protocol``) structurally matches the
  concrete base class so type-checkers see the contract.
* ``_load_plugin`` in ``server.get_ome_plugins`` calls the validator
  (surfacing bad plugins at load time, not at first request).
* The dead ``make_nntp_article`` + Site TODO block was removed from
  ``server/plugins/ome_plugin.py``.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

from server.plugins.ome_plugin import (
    CURRENT_PLUGIN_API_VERSION,
    InvalidPluginError,
    OMEPlugin,
    OMEPluginProtocol,
    validate_plugin,
)


def test_base_plugin_declares_current_api_version() -> None:
    assert OMEPlugin.plugin_api_version == CURRENT_PLUGIN_API_VERSION


def test_validate_plugin_accepts_base_plugin() -> None:
    # Must not raise.
    validate_plugin(OMEPlugin())


def test_validate_plugin_rejects_missing_version() -> None:
    class NoVersion:
        mimetypes = ()
        newsgroups = {}

    with pytest.raises(InvalidPluginError, match="plugin_api_version"):
        validate_plugin(NoVersion())


def test_validate_plugin_rejects_major_version_mismatch() -> None:
    class WrongVersion(OMEPlugin):
        plugin_api_version = "999.0"

    with pytest.raises(InvalidPluginError, match="version"):
        validate_plugin(WrongVersion())


def test_validate_plugin_accepts_same_major_newer_minor() -> None:
    # Minor bumps are backwards-compatible — plugins built for 1.0
    # should still load when core is at 1.5.
    major, _, _minor = CURRENT_PLUGIN_API_VERSION.partition(".")

    class NewerMinor(OMEPlugin):
        plugin_api_version = f"{major}.99"

    validate_plugin(NewerMinor())  # must not raise


def test_protocol_structural_match() -> None:
    # ``typing.Protocol`` (runtime_checkable) isinstance check — the
    # base concrete class must satisfy the protocol.
    assert isinstance(OMEPlugin(), OMEPluginProtocol)


def test_load_plugin_runs_validator(monkeypatch: pytest.MonkeyPatch) -> None:
    """Bad plugins should be caught at module-load time."""
    from server import get_ome_plugins as gop

    class _BadPlugin:
        """Plugin-shaped object that fails the validator (no version)."""

        mimetypes = ()
        newsgroups = {}

    # Point loader at a fake import that returns _BadPlugin.
    import importlib

    def _fake_import_module(name: str) -> object:  # noqa: ARG001
        class _Module:
            BadPlugin = _BadPlugin

        return _Module

    monkeypatch.setattr(importlib, "import_module", _fake_import_module)

    with pytest.raises(InvalidPluginError):
        gop._load_plugin("pkg.mod.BadPlugin")


# ---------- housekeeping ----------


def test_no_commented_make_nntp_article_in_base() -> None:
    """Issue #8 asked to delete the commented ``make_nntp_article`` line."""
    path = Path(__file__).parent.parent / "server" / "plugins" / "ome_plugin.py"
    text = path.read_text(encoding="utf-8")
    # The old commented signature; must not survive.
    assert "# def make_nntp_article" not in text


def test_plugins_readme_exists() -> None:
    """Contract doc promised by issue #8."""
    readme = Path(__file__).parent.parent / "server" / "plugins" / "README.md"
    assert readme.exists(), "server/plugins/README.md is required (issue #8)"
    text = readme.read_text(encoding="utf-8")
    # Sanity: the contract must at least name the key attributes.
    assert re.search(r"plugin_api_version", text)
    assert re.search(r"make_metadata_card_from", text)
