#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "httpx",
# ]
# ///

"""
Fetch ERIC open records by reading their ID from a CSV file.

ERIC_open_records.csv must exist in the same directory as this script.

* uv run --script fetch_eric_open_records.py
"""

import csv
from pathlib import Path

from httpx import AsyncClient

here = Path(__file__).parent

if (json_filepath := here / "fetched_ERIC_open_records.json").exists():
    msg = f"Will not overwrite existing file: {json_filepath}"
    raise AssertionError(msg)


if not (csv_filepath := here / "ERIC_open_records.csv").exists():
    raise FileNotFoundError


async def fetch_eric_open_records() -> None:
    """Fetch ERIC open records by reading their ID from a CSV file."""
    with csv_filepath.open(newline="") as in_file, json_filepath.open("w") as out_file:
        reader = csv.DictReader(in_file)
        async with AsyncClient() as client:
            for i, row in enumerate(reader, start=1):
                row_id = row["id"]
                if i % 10 == 0:
                    print(i, row_id)
                response = await client.get(
                    f"https://api.ies.ed.gov/eric/?search={row_id}"
                )
                response.raise_for_status()
                if (num_found := response.json()["response"]["numFound"]) == 0:
                    print(f"Error: ID {row_id} not found.")
                elif num_found > 1:
                    print(f"Error: ID {row_id} found {num_found} times.")
                else:
                    out_file.write(response.text + "\n")
                if i > 50:
                    break
                await asyncio.sleep(0.5)  # Rate limit to avoid overwhelming the server.


if __name__ == "__main__":
    import asyncio

    asyncio.run(fetch_eric_open_records())

# with csv_filepath.open(newline="") as in_file, json_filepath.open("w") as out_file:
#    out_file.write("[\n")  # Start the JSON array.
#    for i, row in enumerate(csv.DictReader(in_file)):
#        if i % 10 == 0:
#            print(i, row["id"])
#        out_file.write(json.dumps(row, indent=2) + ",\n")
#    # JSON array syntax: Remove the comma and return characters after the last item.
#    out_file.seek(out_file.tell() - 2)
#    out_file.write("\n]\n")  # End the JSON array.
# print(f"Created {json_filepath} from {csv_filepath}.")
