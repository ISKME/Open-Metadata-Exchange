# /// script
# dependencies = [
#     "httpx",
#     "beautifulsoup4"
# ]
# ///

"""
import httpx
from bs4 import BeautifulSoup

URL = "https://qubeshub.org/community/groups/coursesource/publications"

def fetch_page(url):
    response = httpx.get(url, follow_redirects=True)
    response.raise_for_status()
    return response.text

def parse_metadata(html):
    soup = BeautifulSoup(html, "html.parser")
    items = soup.select("div.coursesource-card-contents")
    metadata_list = []

    for item in items[:20]:  # Limit to first 20
        # Title and URL
        title_tag = item.select_one("h5 a")
        title = title_tag.text.strip() if title_tag else "No title"
        link = title_tag['href'] if title_tag else "No link"

        # Courses
        courses_div = item.select_one("div.coursesource-card-courses")
        courses = []
        if courses_div:
            for span in courses_div.select("span a"):
                course_name = span.text.strip()
                if course_name:
                    courses.append(course_name)

        # Keywords
        keywords_div = item.select_one("div.coursesource-card-keywords")
        keywords = []
        if keywords_div:
            for keyword_tag in keywords_div.select("span.keyword a"):
                keyword = keyword_tag.text.strip()
                if keyword:
                    keywords.append(keyword)

        # Remove elements to isolate the description
        if (h5 := item.select_one("h5")):
            h5.extract()
        if courses_div:
            courses_div.extract()
        if keywords_div:
            keywords_div.extract()

        description = item.get_text(strip=True)

        metadata_list.append({
            "title": title,
            "url": f"https://qubeshub.org{link}",
            "description": description,
            "courses": courses,
            "keywords": keywords
        })

    return metadata_list

if __name__ == "__main__":
    html = fetch_page(URL)
    print(f"{len(html) = }")
    metadata = parse_metadata(html)
    print(f"{len(metadata) = }")
    for idx, entry in enumerate(metadata, start=1):
        print(f"{idx}. {entry['title']}")
        print(f"   URL: {entry['url']}")
        print(f"   Description: {entry['description']}")
        print(f"   Courses: {', '.join(entry['courses'])}")
        print(f"   Keywords: {', '.join(entry['keywords'])}\n")
    print("Done.")


    # /// script
# dependencies = [
#     "httpx",
#     "beautifulsoup4"
# ]
# ///
"""

import argparse
import json
from collections.abc import Iterator

import httpx
from bs4 import BeautifulSoup, Tag

URL = "https://qubeshub.org/community/groups/coursesource/publications"


def fetch_page(url: str) -> str:
    response = httpx.get(url, follow_redirects=True)
    response.raise_for_status()
    return response.text


def parse_a_metadata_record(item: Tag) -> dict:
    title_tag = item.select_one("h5 a")
    title = title_tag.text.strip() if title_tag else "No title"
    link = title_tag["href"] if title_tag else "No link"

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
