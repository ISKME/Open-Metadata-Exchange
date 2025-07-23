#!/usr/bin/env -S uv run --script

"""
For each plugin.py file in server/plugins/* directory read attributes such as mimetypes
or newsgroups of each class that is a subclass of OMEPlugin.
"""

import importlib.util
import inspect
import os
from collections.abc import Iterator
from pathlib import Path

from server.plugins.ome_plugin import OMEPlugin

here = Path(__file__).parent
plugins_dir = here.parent / "server" / "plugins"


def _load_plugin(plugin_name: str) -> OMEPlugin:
    plugin_name = plugin_name.split(".")
    plugin_module_name = ".".join(plugin_name[:-1])
    plugin_class_name = plugin_name[-1]

    plugin_module = importlib.import_module(plugin_module_name)
    plugin_class = getattr(plugin_module, plugin_class_name)

    try:
        plugin = plugin_class()
    except ModuleNotFoundError:
        print(f"Failed to load plugin: {plugin_name}")
        return _load_plugin("server.plugins.ome_plugin.OMEPlugin")
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
