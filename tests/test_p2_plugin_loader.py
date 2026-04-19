"""Issue #13 — harden the dynamic plugin loader.

`server.get_ome_plugins._load_plugin` imports arbitrary dotted paths.
Before this change it:

* Accepted any dotted name, whether or not it lived under
  ``server.plugins``.
* Silently swallowed ``ModuleNotFoundError`` and substituted the base
  plugin, hiding real bugs.
* Did not log which plugin actually loaded.

After this change:

* Plugin dotted paths are validated against a strict regex
  (``^server\\.plugins\\.[a-z][a-z0-9_]*(\\.[a-z_][a-z0-9_]*)*\\.[A-Z][A-Za-z0-9_]*$``)
  before import.
* The only silent-fallback case is when ``CMS_PLUGIN`` is unset *and*
  the DEFAULT base plugin is loaded — every other failure raises
  :class:`InvalidPluginError`.
* Successful loads emit an INFO log line so operators can see which
  plugin runs in a given container.
"""

from __future__ import annotations

import importlib
import logging

import pytest

from server.plugins.ome_plugin import InvalidPluginError


# ---------- regex whitelist ----------


@pytest.mark.parametrize(
    "bad_name",
    [
        "os.system",                            # outside server.plugins
        "server.utils.some_helper",             # outside server.plugins
        "server.plugins.__init__.X",            # dunder
        "server.plugins.eric.plugin.../../X",   # path traversal chars
        "server.plugins.eric.plugin.eval",      # lowercase class name
        "server.plugins.Eric.plugin.EricPlugin",  # uppercase module
        "",                                     # empty
        "server.plugins",                       # too short
        "server.plugins.eric.plugin.E;rm -rf",  # shell metachars
    ],
)
def test_load_plugin_rejects_bad_dotted_path(bad_name: str) -> None:
    from server import get_ome_plugins as gop

    with pytest.raises(InvalidPluginError):
        gop._load_plugin(bad_name)


def test_load_plugin_accepts_real_plugin() -> None:
    from server import get_ome_plugins as gop

    plugin = gop._load_plugin("server.plugins.ome_plugin.OMEPlugin")
    # Must satisfy the validator contract (version present).
    assert hasattr(plugin, "plugin_api_version")


# ---------- surface real errors ----------


def test_load_plugin_surfaces_module_not_found(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A typo in CMS_PLUGIN used to be silently masked as the base
    plugin. Now it must raise so the operator notices at startup."""
    from server import get_ome_plugins as gop

    def _raise(name: str) -> object:  # noqa: ARG001
        raise ModuleNotFoundError("no such module")

    monkeypatch.setattr(importlib, "import_module", _raise)

    with pytest.raises(InvalidPluginError):
        gop._load_plugin("server.plugins.definitely_not_real.plugin.NopePlugin")


# ---------- successful loads log ----------


def test_load_plugin_logs_which_plugin_loaded(
    caplog: pytest.LogCaptureFixture,
) -> None:
    from server import get_ome_plugins as gop

    # The `server` logger is configured with propagate=False
    # (logging_config.py), so caplog's root handler cannot see it.
    # Attach caplog's handler directly to the module's logger for the
    # duration of this test.
    target = logging.getLogger("server.get_ome_plugins")
    target.addHandler(caplog.handler)
    target.setLevel(logging.INFO)
    try:
        gop._load_plugin("server.plugins.ome_plugin.OMEPlugin")
    finally:
        target.removeHandler(caplog.handler)

    assert any(
        "OMEPlugin" in rec.message or "ome_plugin" in rec.message
        for rec in caplog.records
    ), "expected a log line identifying the loaded plugin"


# ---------- default-plugin fallback only for load_plugin() ----------


def test_load_plugin_default_works_when_env_unset(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Public `load_plugin()` must keep returning the base plugin
    when CMS_PLUGIN is unset — that is the only legal silent
    fallback."""
    from server import get_ome_plugins as gop

    monkeypatch.delenv("CMS_PLUGIN", raising=False)
    plugin = gop.load_plugin()
    assert plugin.__class__.__name__ == "OMEPlugin"
