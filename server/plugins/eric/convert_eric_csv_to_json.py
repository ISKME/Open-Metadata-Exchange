#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.9"
# dependencies = [
# ]
# ///

"""
Convert ERIC open records CSV to JSON.

ERIC-open-records.csv must exist in the same directory as this script.
ERIC-open-records.json must not exist before running this script.

Edit ERIC-open-records.csv in a text editor and change the first line (column headers):
id,pdf-url,title,description,e_fulltextauth,source,publicationdateyear,abstractor,
peerreviewed,e_yearadded,iesfunded,e_datemodified,publisher,ieslinkpublication,url,
sourceid,ieswwcreviewed,ieslinkwwcreviewguide,ieslinkdatasource,subject,author,
authorxlink,educationlevel,publicationtype,iesgrantcontractnum,
iesgrantcontractnumxlink,language,institution,identifiersgeo,sponsor,identifierstest,
issn,iescited,identifierslaw,audience,isbn

This removes instances of `_ - ` and duplicates of the form `x - x`.

Convert the data in the CSV file to a JSON file.
* uv run --script convert_eric_csv_to_json.py

Format the JSON file with Python's built-in json.tool:
* python3 -m json.tool ERIC-open-records.json ERIC-open-records.json

Make a pydantic model from the JSON file:
* uv tool run --from=datamodel-code-generator datamodel-codegen \
              --input ERIC-open-records.json --input-file-type json \
              --output eric_models.py
"""

import csv
import json
from pathlib import Path

here = Path(__file__).parent

if (json_filepath := here / "ERIC-open-records.json").exists():
    msg = f"Will not overwrite existing file: {json_filepath}"
    raise AssertionError(msg)


if not (csv_filepath := here / "ERIC-open-records.csv").exists():
    raise FileNotFoundError


with csv_filepath.open(newline="") as in_file, json_filepath.open("w") as out_file:
    out_file.write("[\n")  # Start the JSON array.
    for i, row in enumerate(csv.DictReader(in_file)):
        if i % 100 == 0:
            print(i, row["id"])
        out_file.write(json.dumps(row, indent=2) + ",\n")
    # JSON array syntax: Remove the comma and return characters after the last item.
    out_file.seek(out_file.tell() - 2)
    out_file.write("\n]\n")  # End the JSON array.
print(f"Created {json_filepath} from {csv_filepath}.")
