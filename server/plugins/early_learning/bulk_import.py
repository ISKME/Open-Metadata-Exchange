#!/usr/bin/env -S uv run --script

# Source: https://www.earlylearningresourcenetwork.org/books/search?f%5B0%5D=language%3A712
#
# The Early Learning Resource Network site does not expose a public REST or JSON API.
# This module uses web scraping (httpx + BeautifulSoup) to gather metadata from the
# first 8 English-language resources listed on the search results page.

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "beautifulsoup4",
#     "httpx",
#     "pydantic",
# ]
# ///

from datetime import datetime
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

from server.plugins.early_learning.early_learning_models import (
    EarlyLearningItem,
    EarlyLearningModel,
)
from server.plugins.early_learning.plugin import EarlyLearningPlugin

SEARCH_URL = (
    "https://www.earlylearningresourcenetwork.org/books/search?f%5B0%5D=language%3A712"
)
BASE_URL = "https://www.earlylearningresourcenetwork.org"
MAX_RESULTS = 8

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; OME-Bot/1.0; "
        "+https://github.com/ISKME/Open-Metadata-Exchange)"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

plugin = EarlyLearningPlugin()


def _absolute_url(href: str) -> str:
    """Return an absolute URL, prepending BASE_URL when href is relative."""
    if href.startswith("http"):
        return href
    return BASE_URL + href


def _text(soup: BeautifulSoup, selector: str) -> str:
    """Return stripped text for the first matching CSS selector, or ''."""
    tag = soup.select_one(selector)
    return tag.get_text(separator=" ", strip=True) if tag else ""


def _text_list(soup: BeautifulSoup, selector: str) -> list[str]:
    """Return a list of stripped text values for all matching CSS selectors."""
    return [
        tag.get_text(strip=True)
        for tag in soup.select(selector)
        if tag.get_text(strip=True)
    ]


def scrape_resource_page(client: httpx.Client, url: str) -> EarlyLearningItem:
    """
    Fetch a single resource page and extract metadata.

    The Early Learning Resource Network is a Drupal site.  Field markup follows
    the standard Drupal 9/10 pattern: ``div.field--name-field-<name>``.
    """
    response = client.get(url, headers=HEADERS, follow_redirects=True)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    # Title — Drupal page title
    title = _text(soup, "h1.page-title") or _text(soup, "h1")

    # Body / description
    description = (
        _text(soup, "div.field--name-body")
        or _text(soup, "div.field--name-field-description")
        or _text(soup, "div.field--type-text-with-summary")
        or ""
    )

    # Authors — Drupal field for person/creator
    authors = (
        _text_list(soup, "div.field--name-field-author a")
        or _text_list(soup, "div.field--name-field-author .field__item")
        or _text_list(soup, "div.field--name-field-creator .field__item")
    )

    # Subjects / topic tags
    subjects = (
        _text_list(soup, "div.field--name-field-subject a")
        or _text_list(soup, "div.field--name-field-subjects a")
        or _text_list(soup, "div.field--name-field-topic a")
    )

    # Publisher / authoring institution
    publisher = (
        _text(soup, "div.field--name-field-publisher .field__item")
        or _text(soup, "div.field--name-field-organization .field__item")
        or ""
    )

    # Language
    language = _text(soup, "div.field--name-field-language .field__item") or "English"

    # License
    license_text = (
        _text(soup, "div.field--name-field-license .field__item")
        or _text(soup, "div.field--name-field-license a")
        or ""
    )

    # Publication / creation date
    date_str = (
        _text(soup, "div.field--name-field-date .field__item")
        or _text(soup, "time[datetime]")
        or ""
    )
    date_tag = soup.select_one("time[datetime]")
    if date_tag and date_tag.get("datetime"):
        date_str = str(date_tag["datetime"])

    # Parse date — accept None on failure
    date = None
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%Y"):
        try:
            date = datetime.strptime(date_str[: len(fmt)], fmt).replace(
                tzinfo=datetime.UTC
            )
            break
        except ValueError:
            continue

    return EarlyLearningItem(
        title=title,
        url=url,
        description=description,
        authors=authors,
        subjects=subjects,
        language=language,
        license=license_text,
        publisher=publisher,
        date=date,
    )


def scrape_search_results(
    client: httpx.Client, url: str = SEARCH_URL, max_results: int = MAX_RESULTS
) -> list[str]:
    """
    Fetch the search results page and return up to *max_results* resource URLs.

    Drupal Views renders search results as ``<article>`` elements.  We look for
    the canonical ``<h3 class="node__title">`` / ``<h2 class="node__title">``
    title links used by many Drupal themes.
    """
    response = client.get(url, headers=HEADERS, follow_redirects=True)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    urls: list[str] = []

    # Strategy 1: article elements with a title link
    for article in soup.select("article"):
        if len(urls) >= max_results:
            break
        link = (
            article.select_one("h3.node__title a")
            or article.select_one("h2.node__title a")
            or article.select_one(".views-field-title a")
            or article.select_one("a[href*='/books/']")
        )
        if link and link.get("href"):
            urls.append(_absolute_url(str(link["href"])))

    # Strategy 2: generic views-row elements
    if not urls:
        for row in soup.select(".views-row"):
            if len(urls) >= max_results:
                break
            link = row.select_one("a[href*='/books/']") or row.select_one("a")
            if link and link.get("href"):
                urls.append(_absolute_url(str(link["href"])))

    return urls[:max_results]


def bulk_import(
    url: str = SEARCH_URL, max_results: int = MAX_RESULTS
) -> list[EarlyLearningItem]:
    """
    Scrape the first *max_results* English-language resources from the Early
    Learning Resource Network search page and return them as a list of
    ``EarlyLearningItem`` objects.

    Results are cached locally in ``early_learning_resources.json`` so that
    subsequent runs do not re-fetch the site.
    """
    here = Path(__file__).resolve().parent
    cache_path = here / "early_learning_resources.json"

    if cache_path.exists():
        return EarlyLearningModel.model_validate_json(cache_path.read_text()).root

    items: list[EarlyLearningItem] = []
    with httpx.Client(timeout=30) as client:
        resource_urls = scrape_search_results(client, url, max_results)
        for resource_url in resource_urls:
            item = scrape_resource_page(client, resource_url)
            items.append(item)

    # Cache the results
    model = EarlyLearningModel(root=items)
    cache_path.write_text(model.model_dump_json(indent=2))

    return items


if __name__ == "__main__":
    records = bulk_import()
    print(f"Fetched {len(records)} records\n")
    for i, record in enumerate(records, start=1):
        print(f"{i:>2}. {record.title!r}")
        print(f"    url:       {record.url}")
        print(f"    authors:   {record.authors}")
        print(f"    subjects:  {record.subjects}")
        print(f"    publisher: {record.publisher!r}")
        print(f"    date:      {record.date}")
        print(f"    license:   {record.license!r}")
        print()

    p = plugin
    print("\n--- EducationResource cards ---\n")
    for record in records:
        card = p.make_metadata_card_from_dict(record.model_dump())
        print(f"  title: {card.title!r}")
        print(f"  source_url: {card.source_url!r}")
        print(f"  spdx_license_expression: {card.spdx_license_expression!r}")
        print()
