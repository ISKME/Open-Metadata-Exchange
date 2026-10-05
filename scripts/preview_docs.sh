#!/bin/bash

# Use Sphinx to build and view this project's documentation.

if [ -n "$VIRTUAL_ENV" ]; then
    echo "Virtual environment is active: $VIRTUAL_ENV"
else
    echo "Before running this script, please: 'source .venv/bin/activate'"
    exit 1
fi

find_open_command() {
    local OPEN_COMMAND

    for OPEN_COMMAND in "$@"; do
        if command -v "$OPEN_COMMAND" >/dev/null 2>&1; then
            echo "$OPEN_COMMAND"
            return 0
        fi
    done

    echo "No open command found (tried: $*)" >&2
    return 1
}

uv sync --group docs
uv run sphinx-build -c docs . docs/_build/html

# Use 'xdg-open' on Linux, 'open' on macOS, or exit with an error if neither is found.
OPEN_COMMAND=$(find_open_command xdg-open open) || exit 1
"$OPEN_COMMAND" docs/_build/html/index.html
