#!/usr/bin/env -S uv run --script
#
# /// script
# dependencies = [
#     "beautifulsoup4",
#     "httpx",
#     "rich",
# ]
# ///

import argparse
import json
from collections.abc import Iterator

import httpx
from bs4 import BeautifulSoup, Tag
from rich.console import Console
from rich.table import Table

URL = "https://qubeshub.org/community/groups/coursesource/publications"


def fetch_page(url: str) -> str:
    response = httpx.get(url, follow_redirects=True)
    response.raise_for_status()
    return response.text


def parse_a_metadata_record(item: Tag) -> dict:
    title_tag = item.select_one("h5 a")
    title = title_tag.text.strip() if title_tag else "No title"
    link = (title_tag or {}).get("href", "No link")

    courses_div = item.select_one("div.coursesource-card-courses")
    courses = (
        [span.text.strip() for span in courses_div.select("span a")]
        if courses_div
        else []
    )

    keywords_div = item.select_one("div.coursesource-card-keywords")
    keywords = (
        [
            keyword_tag.text.strip()
            for keyword_tag in keywords_div.select("span.keyword a")
        ]
        if keywords_div
        else []
    )

    if h5 := item.select_one("h5"):
        h5.extract()
    if courses_div:
        courses_div.extract()
    if keywords_div:
        keywords_div.extract()

    description = item.get_text(strip=True)

    return {
        "title": title,
        "url": f"https://qubeshub.org{link}",
        "description": description,
        "courses": courses,
        "keywords": keywords,
    }


def parse_metadata(html: str) -> Iterator[dict]:
    soup = BeautifulSoup(html, "html.parser")
    items = soup.select("div.coursesource-card-contents")
    for item in items:
        yield parse_a_metadata_record(item)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape metadata from CourseSource.")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--rich", action="store_true", help="Output as rich tables")
    args = parser.parse_args()

    html = fetch_page(URL)
    metadata_iter = parse_metadata(html)

    if args.json:
        # Dump entire list to JSON
        print(json.dumps(list(metadata_iter), indent=2))
    else:
        for idx, entry in enumerate(metadata_iter, start=1):
            print(f"{idx}. {entry['title']}")
            print(f"   URL: {entry['url']}")
            print(f"   Description: {entry['description']}")
            print(f"   Courses: {', '.join(entry['courses'])}")
            print(f"   Keywords: {', '.join(entry['keywords'])}\n")

    if args.rich:
        console = Console()
        table = Table(title="CourseSource Metadata")

        table.add_column("Title", justify="left")
        table.add_column("URL", justify="left")
        table.add_column("Description", justify="left")
        table.add_column("Courses", justify="left")
        table.add_column("Keywords", justify="left")

        for i, entry in enumerate(parse_metadata(html), start=1):
            table.add_row(
                f"{i:>2}. {entry['title']}",
                entry["url"],
                entry["description"],
                ", ".join(entry["courses"]),
                ", ".join(entry["keywords"]),
                style="white" if i % 2 else "grey50",
            )
            if i > 6:
                break

        console.print(table)
    print("Done.")
