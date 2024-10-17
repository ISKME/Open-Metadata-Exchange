#!/usr/bin/env python3

"""
The purpose of this tool is to read a captured .har file and
create a directory structure under '/static' DIRECTORY and
save the json content from the har file in "index.json" files,
to be served by server.helpers.MocAPI middleware.

typical usage:
./har_parser.py ../../static/ name_of_har_file.har
"""

import json
import os
import sys
from urllib.parse import urlparse

_, output_dir, har_filename = sys.argv[:3]


def get_path(entry: dict) -> str:
    parts = urlparse(entry["request"]["url"])
    return parts.path


def is_api_call(entry: dict) -> bool:
    path: str = get_path(entry)
    mime_type: str = entry["response"]["content"]["mimeType"]
    return path.startswith("/api/imls/") and mime_type == "application/json"


def ensure_dir(directory: str) -> None:
    if not os.path.isdir(directory):
        os.makedirs(directory)


def get_response(entry: str) -> dict:
    try:
        return json.loads(entry["response"]["content"]["text"])
    except (json.JSONDecodeError, KeyError):
        print(get_path(entry))
        print(entry["response"]["content"].keys())
        return {}


with open(har_filename) as f:
    har: dict = json.load(f)
    for entry in har["log"]["entries"]:
        if is_api_call(entry):
            path = get_path(entry)[1:]
            full_dir = os.path.join(output_dir, path)
            ensure_dir(full_dir)

            filename = "index.json"
            full_path = os.path.join(full_dir, filename)
            response = get_response(entry)
            with open(full_path, "w") as out_file:
                json.dump(response, out_file, indent=2)
