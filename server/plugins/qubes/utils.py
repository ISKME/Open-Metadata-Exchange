# /// script
# dependencies = [
#     "httpx",
#     "rich",
# ]
# ///

import xml.etree.ElementTree as ET
from datetime import UTC, datetime

import httpx

from server.plugins.ome_plugin import EducationResource

ns = {
    "oai": "http://www.openarchives.org/OAI/2.0/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "oai_dc": "http://www.openarchives.org/OAI/2.0/oai_dc/",
}


def extract_from_url(url: str) -> EducationResource:
    url = f"https://qubeshub.org/oaipmh/?verb=GetRecord&metadataPrefix=qdc&identifier={url}"
    response = httpx.get(
        url, follow_redirects=True, timeout=30, headers={"Accept": "application/xml"}
    ).raise_for_status()
    root = ET.fromstring(response.text)  # noqa: S314

    # Find the metadata section
    metadata = root.find(".//oai:metadata", ns)

    # Grab Dublin Core elements inside
    title_element = metadata.find(".//dc:title", ns)
    title = title_element.text if title_element is not None else ""

    description_element = metadata.find(".//dc:description", ns)
    description = description_element.text if description_element is not None else ""

    authors = [el.text for el in metadata.findall(".//dc:creator", ns)]
    subject_tags = [el.text for el in metadata.findall(".//dc:subject", ns)]

    if (creation_date_element := metadata.find(".//dc:date", ns)) is not None:
        creation_date = datetime.strptime(
            creation_date_element.text, "%Y-%m-%dT%H:%M:%SZ"
        ).replace(tzinfo=UTC)
    else:
        creation_date = None

    source_url_element = metadata.find(".//dc:identifier", ns)
    source_url = source_url_element.text if source_url_element is not None else ""

    return EducationResource(
        title=title,
        description=description,
        authors=authors,
        subject_tags=subject_tags,
        creation_date=creation_date,
        source_url=source_url,
    )
