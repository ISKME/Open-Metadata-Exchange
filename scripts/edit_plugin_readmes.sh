#!/bin/bash

# Open in an editor the README.md files for all plugins in the server/plugins directory.

find_editor() {
    local EDITOR

    for EDITOR in "$@"; do
        if command -v "$EDITOR" >/dev/null 2>&1; then
            echo "$EDITOR"
            return 0
        fi
    done

    echo "No editor found (tried: $*)" >&2
    return 1
}

# Find an editor or exit with an error if none is found.
EDITORS="code vi emacs"
# shellcheck disable=SC2086
EDITOR=$(find_editor "${EDITOR%% *}" $EDITORS) || exit 1

readmes=(server/plugins/*/README.md)
"$EDITOR" "${readmes[@]}"
