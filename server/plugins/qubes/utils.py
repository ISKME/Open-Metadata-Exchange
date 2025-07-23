# /// script
# dependencies = [
#     "beautifulsoup4",
#     "httpx",
#     "rich",
# ]
# ///


import httpx
from bs4 import BeautifulSoup

from server.plugins.ome_plugin import EducationResource


def fetch_page(url: str) -> str:
    return httpx.get(url, follow_redirects=True, timeout=30).raise_for_status().text


def extract_from_url(url: str) -> EducationResource:
    page = fetch_page(url)
    soup = BeautifulSoup(page, "html.parser")
    return EducationResource(
        title=soup.select("div.title-wrapper div.title h2")[0].text,
        description=soup.select("div.abstract-full")[0].text,
        source_url=url,
    )
