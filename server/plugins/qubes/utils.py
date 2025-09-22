# /// script
# dependencies = [
#     "beautifulsoup4",
#     "httpx",
#     "rich",
# ]
# ///


import httpx
import xml.etree.ElementTree as ET

from datetime import datetime
from server.plugins.ome_plugin import EducationResource

def extract_from_url(url: str) -> EducationResource:
    url = f"https://qubeshub.org/oaipmh/?verb=GetRecord&metadataPrefix=qdc&identifier={url}"
    response = httpx.get(url, follow_redirects=True, timeout=30, headers={"Accept": "application/xml"})
    response.raise_for_status()

    root = ET.fromstring(response.text)
    # Define namespaces
    ns = {
        "oai": "http://www.openarchives.org/OAI/2.0/",
        "dc": "http://purl.org/dc/elements/1.1/",
        "oai_dc": "http://www.openarchives.org/OAI/2.0/oai_dc/"
    }

    # Find the metadata section
    metadata = root.find(".//oai:metadata", ns)

    # Grab Dublin Core elements inside
    title = metadata.find(".//dc:title", ns).text if metadata.find(".//dc:title", ns) is not None else ""
    description = metadata.find(".//dc:description", ns).text if metadata.find(".//dc:description", ns) is not None else ""
    authors = [el.text for el in metadata.findall(".//dc:creator", ns)]
    subject_tags = [el.text for el in metadata.findall(".//dc:subject", ns)]
    creation_date = datetime.strptime(metadata.find(".//dc:date", ns).text, "%Y-%m-%dT%H:%M:%SZ") if metadata.find(".//dc:date", ns) is not None else None
    source_url = metadata.find(".//dc:identifier", ns).text if metadata.find(".//dc:identifier", ns) is not None else ""

    return EducationResource(
        title=title,
        description=description,
        authors=authors,
        subject_tags=subject_tags,
        creation_date=creation_date,
        source_url=source_url,
    )
