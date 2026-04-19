#!/usr/bin/env -S uv run --script

"""
For each plugin.py file in server/plugins/* directory read attributes such as mimetypes
or newsgroups of each class that is a subclass of OMEPlugin.
"""

import importlib.util
import inspect
import logging
import os
import re
from collections.abc import Iterator
from pathlib import Path

from server.plugins.ome_plugin import (
    InvalidPluginError,
    OMEPlugin,
    validate_plugin,
)

logger = logging.getLogger(__name__)

here = Path(__file__).parent
plugins_dir = here.parent / "server" / "plugins"

# Plugin dotted paths must live under `server.plugins.*` and follow
# Python identifier rules at every segment. The final segment is the
# class (PascalCase); every preceding module segment is snake_case
# starting with a lowercase letter (no leading underscore, so
# ``__init__`` and private modules are rejected). Issue #13.
_PLUGIN_PATH_RE = re.compile(
    r"^server\.plugins"
    r"\.[a-z][a-z0-9_]*"
    r"(?:\.[a-z][a-z0-9_]*)*"
    r"\.[A-Z][A-Za-z0-9_]*$"
)


def _load_plugin(plugin_name: str) -> OMEPlugin:
    # Validate the dotted path before touching importlib so a hostile
    # or typo'd value cannot execute arbitrary modules. Issue #13.
    if not _PLUGIN_PATH_RE.match(plugin_name):
        raise InvalidPluginError(
            f"Refusing to load plugin {plugin_name!r}: not a valid "
            "server.plugins.<module>.<ClassName> path."
        )

    module_path, _, class_name = plugin_name.rpartition(".")

    try:
        plugin_module = importlib.import_module(module_path)
    except ModuleNotFoundError as exc:
        # Previously this error was silently masked by substituting
        # the base plugin. That hid typos in CMS_PLUGIN for weeks.
        # Fail loudly so operators see the problem at startup.
        raise InvalidPluginError(
            f"Could not import plugin module {module_path!r}: {exc}"
        ) from exc

    try:
        plugin_class = getattr(plugin_module, class_name)
    except AttributeError as exc:
        raise InvalidPluginError(
            f"Module {module_path!r} has no attribute {class_name!r}."
        ) from exc

    plugin = plugin_class()
    validate_plugin(plugin)
    logger.info("Loaded plugin: %s", plugin_name)
    return plugin


def load_plugin() -> OMEPlugin:
    plugin = os.getenv("CMS_PLUGIN", "server.plugins.ome_plugin.OMEPlugin")
    return _load_plugin(plugin)


def get_ome_plugins_from_path(file_path: Path) -> Iterator[type[OMEPlugin]]:
    file_path = Path(file_path).resolve()
    module_name = file_path.stem

    # Load the module from the file
    spec = importlib.util.spec_from_file_location(module_name, str(file_path))
    module = importlib.util.module_from_spec(spec)
    # sys.modules[module_name] = module
    spec.loader.exec_module(module)

    for _name, plugin in inspect.getmembers(module, inspect.isclass):
        if (
            issubclass(plugin, OMEPlugin)
            and plugin is not OMEPlugin
            and plugin.__module__ == module.__name__
        ):
            yield plugin


def get_ome_plugins() -> Iterator[type[OMEPlugin]]:
    for directory in sorted(plugins_dir.iterdir()):
        if directory.is_dir():
            for file_path in directory.glob("plugin.py"):
                yield from get_ome_plugins_from_path(file_path)


def get_newsgroups_from_plugins() -> dict[str, str]:
    """
    Return the content of the newsgroups attribute of all OMEPlugins.
    """
    newsgroups = {}
    for plugin in get_ome_plugins():
        newsgroups.update(plugin.newsgroups)
    return newsgroups


if __name__ == "__main__":
    import json

    for plugin in get_ome_plugins():
        print(f"{plugin.__name__}: {plugin.mimetypes=}\n\t\t{plugin.newsgroups=}")
    print(json.dumps(get_newsgroups_from_plugins(), indent=2))
