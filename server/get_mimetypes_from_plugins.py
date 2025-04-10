#!/usr/bin/env -S uv run --script

"""
for each plugin.py file in server/plugins/* directory read the mimetype attribute of
each class that is a subclass of OMEPlugin.
"""

import importlib.util
import inspect
from collections.abc import Iterator
from pathlib import Path

from server.plugins.ome_plugin import OMEPlugin

here = Path(__file__).parent
plugins_dir = here.parent / "server" / "plugins"


def extract_mimetypes(file_path: Path) -> Iterator[str]:
    file_path = Path(file_path).resolve()
    module_name = file_path.stem

    # Load the module from the file
    spec = importlib.util.spec_from_file_location(module_name, str(file_path))
    module = importlib.util.module_from_spec(spec)
    # sys.modules[module_name] = module
    spec.loader.exec_module(module)

    for _name, obj in inspect.getmembers(module, inspect.isclass):
        if (
            issubclass(obj, OMEPlugin)
            and obj is not OMEPlugin
            and obj.__module__ == module.__name__
        ):
            yield obj


def get_plugin_mimetypes() -> Iterator[str]:
    for directory in plugins_dir.iterdir():
        if directory.is_dir():
            for file_path in directory.glob("plugin.py"):
                yield from extract_mimetypes(file_path)


if __name__ == "__main__":
    for plugin in get_plugin_mimetypes():
        print(f"Plugin: {plugin.__name__}, Mimetypes: {plugin.mimetypes}")
