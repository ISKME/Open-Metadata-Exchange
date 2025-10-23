# /// script
# dependencies = [
#     "httpx",
#     "rich",
# ]
# ///

import xml.etree.ElementTree as ET
from datetime import UTC, datetime
from urllib.parse import urlparse

import httpx

from server.plugins.ome_plugin import EducationResource

ns = {
    "oai": "http://www.openarchives.org/OAI/2.0/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "oai_dc": "http://www.openarchives.org/OAI/2.0/oai_dc/",
}


def license_url_to_spdx_id(url: str) -> str:
    netloc = urlparse(url).netloc
    path = urlparse(url).path.strip("/").split("/")

    spdx_id = ""
    if netloc == "creativecommons.org" and len(path) >= 3:
        version = path[2]  # CC version number
        if path[0] == "licenses":
            # Example: http://creativecommons.org/licenses/by-nc-sa/4.0/
            license_parts = path[1].upper().split("-")  # ['BY', 'NC', 'ND', 'SA']
            spdx_id = "CC-" + "-".join([*license_parts, version])
        elif path[0] == "publicdomain" and path[1] == "zero":
            # Example: http://creativecommons.org/publicdomain/zero/1.0/
            spdx_id = f"CC0-{version}"

    return spdx_id


def extract_from_url(url: str) -> EducationResource:
    api_url = f"http://qubeshub.org/oaipmh/?verb=GetRecord&metadataPrefix=qdc&identifier={url}"
    # api_url = f"http://ddev-qubeshub-web:80/oaipmh/?verb=GetRecord&metadataPrefix=qdc&identifier={url}"
    response = httpx.get(
        api_url,
        follow_redirects=True,
        timeout=30,
        headers={"Accept": "application/xml"},
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

    version_url_element = metadata.find(".//dc:identifier", ns)
    version_url = version_url_element.text if version_url_element is not None else ""

    source_url = "/".join([*url.rstrip("/").split("/")[:-1], "main"])

    spdx_license_expression_element = metadata.find(".//dc:rights", ns)
    spdx_license_expression = (
        license_url_to_spdx_id(spdx_license_expression_element.text)
        if spdx_license_expression_element is not None
        else ""
    )

    return EducationResource(
        title=title,
        description=description,
        authors=authors,
        subject_tags=subject_tags,
        creation_date=creation_date,
        source_url=source_url,
        version_url=version_url,
        spdx_license_expression=spdx_license_expression,
    )
