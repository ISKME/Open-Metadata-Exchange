#!/usr/bin/env -S uv run --script

# PYTHONPATH="." scripts/sync_plugin_docs.py && scripts/preview_docs.sh

import inspect
import os
from ast import literal_eval
from collections.abc import Iterable
from pathlib import Path
from subprocess import run

from server.plugins.ome_plugin import OMEPlugin

script_name = Path(__file__).name
server_dir = Path(__file__).parent.parent
plugins_dir = server_dir / "server" / "plugins"


def py_literal_to_md_list(text: str) -> str:
    """Convert a Python literal (list or tuple) to a Markdown list.
    "['a', 'b', 'c']") --> '1. a\n2. b\n3. c'
    """
    return "\n".join(
        f"{i}. {line}" for i, line in enumerate(literal_eval(text), start=1)
    )


def get_plugin_readmes(plugins_dir: Path) -> Iterable[Path]:
    for plugin_path in plugins_dir.iterdir():
        if (readme_path := plugin_path / "README.md").exists():
            yield readme_path


def get_tree_of_plugin(plugin_dir: Path) -> str:
    """Return a tree of all files in the plugin directory."""
    tree_cmd = ["tree", "--gitignore", str(plugin_dir.relative_to(server_dir))]
    result = run(tree_cmd, capture_output=True, check=True, text=True)  # noqa: S603
    return f"```text\n{result.stdout}```\n"


def get_plugin_mimetypes_and_newsgroups(plugin_dir: Path) -> str:
    """Return a string representation of the plugin's mimetypes and newsgroups.
    Use Python's inspect module to find the OMEPlugin subclass in plugin.py"""
    plugin_module = __import__(
        f"server.plugins.{plugin_dir.name}.plugin", fromlist=[""]
    )
    plugin_class = next(
        cls
        for _name, cls in inspect.getmembers(plugin_module, inspect.isclass)
        if issubclass(cls, OMEPlugin) and cls is not OMEPlugin
    )
    mimetypes = py_literal_to_md_list(str(getattr(plugin_class, "mimetypes", ())))
    newsgroups = str(getattr(plugin_class, "newsgroups", {}))
    return f"**MIMETYPES:**\n{mimetypes}\n\n**NEWSGROUPS:**\n\n{newsgroups}"


def append_text_to_file(file_path: Path, text: str) -> int:
    """Append text to a file, creating the file if it doesn't exist."""
    file_lines = new_file_lines = file_path.read_text(encoding="utf-8").splitlines()
    for i, line in enumerate(file_lines, start=1):
        if script_name in line:
            new_file_lines = file_lines[:i]
            break
    if new_file_lines == file_lines:
        msg = f"Could not find {script_name} in {file_path}"
        raise ValueError(msg)
    new_file_text = "\n".join(new_file_lines)
    new_file_text = f"{new_file_text}\n\n{text}\n"
    return file_path.write_text(new_file_text, encoding="utf-8")


def sync_plugin_docs(readme_path: Path) -> int:
    """
    Edit a plugin README.md fileby finding the sentence that contains `script_name` and
    all lines below with:
    1. The mimetypes and newsgroups defined in the OME plugin class in `plugin.py`
    2. A tree of all files in the plugin directory
    """

    plugin_dir = readme_path.parent
    tree = get_tree_of_plugin(plugin_dir)
    mimetypes_and_newsgroups = get_plugin_mimetypes_and_newsgroups(plugin_dir)
    lines = f"{mimetypes_and_newsgroups}\n{tree}"
    line_count = len(lines.splitlines())
    if os.getenv("CI") == "true":
        print(f"Appending {line_count} lines to {readme_path.relative_to(server_dir)}")
        print(lines)
    append_text_to_file(readme_path, lines)
    return line_count


if __name__ == "__main__":
    total_lines = 0
    for _i, readme_path in enumerate(get_plugin_readmes(plugins_dir), start=1):
        total_lines += sync_plugin_docs(readme_path)
    print(f"Total lines appended: {total_lines} to {_i} plugin README.md files.")
