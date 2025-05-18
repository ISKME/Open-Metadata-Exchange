#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "xmltodict",
# ]
# ///

import json
import xml.etree.ElementTree as ET
from pathlib import Path

here = Path(__file__).parent

if (json_filepath := here / "results.json").exists():
    msg = f"Will not overwrite existing file: {json_filepath}"
    raise AssertionError(msg)

if not (xml_filepath := here / "results.xml").exists():
    msg = f"Could not find XML file: {xml_filepath}"
    raise FileNotFoundError(msg)


old_dict = {
    "{http://www.openarchives.org/OAI/2.0/}header": {
        "{http://www.openarchives.org/OAI/2.0/}identifier": "https://qubeshub.org/publications/2/1",
        "{http://www.openarchives.org/OAI/2.0/}datestamp": "2016-02-18T04:13:55Z",
        "{http://www.openarchives.org/OAI/2.0/}setSpec": "publications:",
    },
    "{http://www.openarchives.org/OAI/2.0/}metadata": {
        "{http://www.openarchives.org/OAI/2.0/oai_dc/}dc": {
            "{http://purl.org/dc/elements/1.1/}title": "DataNuggets Resources [version 1.0]",
            "{http://purl.org/dc/elements/1.1/}creator": "Drew LaMar",
            "{http://purl.org/dc/elements/1.1/}subject": "DataNuggets",
            "{http://purl.org/dc/elements/1.1/}date": "2016-02-18T04:13:55Z",
            "{http://purl.org/dc/elements/1.1/}identifier": "https://qubeshub.org/publications/2/1",
            "{http://purl.org/dc/elements/1.1/}description": "DataNuggets Resources",
            "{http://purl.org/dc/elements/1.1/}type": "dataset",
            "{http://purl.org/dc/elements/1.1/}rights": "https://creativecommons.org/publicdomain/zero/1.0/",
        }
    },
}

new_dict = {
    "identifier": "https://qubeshub.org/publications/2/1",
    "datestamp": "2016-02-18T04:13:55Z",
    "setSpec": "publications:",
    "title": "DataNuggets Resources [version 1.0]",
    "creator": "Drew LaMar",
    "subject": "DataNuggets",
    "date": "2016-02-18T04:13:55Z",
    "description": "DataNuggets Resources",
    "type": "dataset",
    "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
}


def old_to_new_dict(old_dict: dict[str, dict | str]) -> dict[str, str]:
    """
    >>> old_to_new_dict(old_dict) == new_dict
    True
    """
    # old_dict = dict(old_dict)
    # old_dict = old_dict.copy()
    print(f"{type(old_dict)}: {old_dict = }")
    new_dict = {}
    for key, value in old_dict.items():
        if isinstance(value, dict):
            # Recursively flatten the dictionary
            new_dict.update(old_to_new_dict(value))
        else:
            # Remove the namespace from the key
            new_key = key.split("}")[-1]
            new_dict[new_key] = value
    new_dict.pop("datestamp", None)  # Duplicates new_dict["date"]
    return new_dict


def xml_to_dict(element):
    """Convert an XML element and its children to a dictionary."""
    if len(element) == 0:  # If the element has no children
        return element.text.strip() if element.text else None

    result = {}
    for child in element:
        child_dict = xml_to_dict(child)
        if child.tag in result:
            # If the tag already exists, convert it to a list
            if isinstance(result[child.tag], list):
                result[child.tag].append(child_dict)
            else:
                result[child.tag] = [result[child.tag], child_dict]
        else:
            result[child.tag] = child_dict
    return result


def convert_xml_to_json(xml_file, json_file):
    """Convert XML file to JSON file."""
    # Parse the XML file
    tree = ET.parse(xml_file)
    root = tree.getroot()

    # Convert XML to dictionary
    xml_dict = xml_to_dict(root)
    # For each record in the ListRecords tag, keep only the data in the metadata dc tag
    # "{http://www.openarchives.org/OAI/2.0/}ListRecords": {
    #    "{http://www.openarchives.org/OAI/2.0/}record": [
    xml_dict = xml_dict["{http://www.openarchives.org/OAI/2.0/}ListRecords"][
        "{http://www.openarchives.org/OAI/2.0/}record"
    ]

    records = [old_to_new_dict(d) for d in xml_dict]
    print(f"{len(records)} records were converted.")

    # Write the list of records to a JSON file
    json_filepath.write_text(json.dumps(records, indent=4))


if __name__ == "__main__":
    convert_xml_to_json(xml_filepath, json_filepath)
