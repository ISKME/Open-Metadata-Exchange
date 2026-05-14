#!/usr/bin/env -S uv run --script
#
# Source: https://ocw.mit.edu/courses/find-by-topic/topics.json
# Fallback mentioned in issue: https://ocw.mit.edu/search/?q=python
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "beautifulsoup4",
#     "httpx",
#     "pydantic",
# ]
# ///

import asyncio
import json
import logging
from collections.abc import Iterator
from pathlib import Path
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from server.plugins.mit_opencourseware.mit_opencourseware_models import (
    MITOCWCourse,
    MITOCWCourseListing,
    MITOCWTopicIndexItem,
)
from server.plugins.mit_opencourseware.plugin import MITOpenCourseWarePlugin
from server.plugins.ome_plugin import EducationResource

MIT_OCW_BASE_URL = "https://ocw.mit.edu"
MIT_OCW_TOPICS_INDEX_URL = f"{MIT_OCW_BASE_URL}/courses/find-by-topic/topics.json"
MIT_OCW_TOPIC_URL_PREFIX = f"{MIT_OCW_BASE_URL}/courses/find-by-topic/"
DEFAULT_QUERY = "python"
DEFAULT_LIMIT = 50

logger = logging.getLogger(__name__)
plugin = MITOpenCourseWarePlugin()


def _status_code_from_http_error(exc: httpx.HTTPError) -> str | int:
    return exc.response.status_code if isinstance(exc, httpx.HTTPStatusError) else "N/A"


def _normalize_course_url(href: str) -> str:
    return urljoin(f"{MIT_OCW_BASE_URL}/", href)


def _normalized_query(query: str) -> str:
    return query.strip().casefold()


def _text_matches_query(query: str, *values: str) -> bool:
    if not (needle := _normalized_query(query)):
        return True
    return any(needle in value.casefold() for value in values if value)


def _dedupe_strings(values: list[str]) -> list[str]:
    deduped: list[str] = []
    seen: set[str] = set()
    for value in values:
        cleaned = value.strip()
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            deduped.append(cleaned)
    return deduped


def _topic_labels(listing: MITOCWCourseListing) -> list[str]:
    labels: list[str] = []
    for topic in listing.topics:
        labels.extend([topic.sub_cat, topic.speciality])
    return _dedupe_strings(labels)


def _listing_matches_query(listing: MITOCWCourseListing, query: str) -> bool:
    return _text_matches_query(query, listing.title, *_topic_labels(listing))


def _course_matches_query(course: MITOCWCourse, query: str) -> bool:
    return _text_matches_query(
        query,
        course.title,
        course.description,
        *course.authors,
        *course.subject_tags,
    )


def _names_from_value(value: object) -> list[str]:
    if isinstance(value, str):
        return [value.strip()] if value.strip() else []
    if isinstance(value, dict):
        return _names_from_value(
            value.get("name")
            or value.get("title")
            or value.get("legalName")
            or value.get("author")
        )
    if isinstance(value, list):
        names: list[str] = []
        for item in value:
            names.extend(_names_from_value(item))
        return _dedupe_strings(names)
    return []


def _extract_json_ld_course_values(payload: object) -> tuple[str, str, list[str]]:
    title = ""
    description = ""
    authors: list[str] = []

    if isinstance(payload, list):
        for item in payload:
            child_title, child_description, child_authors = (
                _extract_json_ld_course_values(item)
            )
            title = title or child_title
            description = description or child_description
            authors.extend(child_authors)
        return title, description, _dedupe_strings(authors)

    if not isinstance(payload, dict):
        return title, description, authors

    raw_type = payload.get("@type")
    types = raw_type if isinstance(raw_type, list) else [raw_type]
    if any(item in {"Course", "CreativeWork", "LearningResource"} for item in types):
        title = str(payload.get("name") or payload.get("headline") or "").strip()
        description = str(payload.get("description") or "").strip()
        authors.extend(
            _names_from_value(
                payload.get("author")
                or payload.get("creator")
                or payload.get("instructor")
                or payload.get("provider")
            )
        )

    for value in payload.values():
        child_title, child_description, child_authors = _extract_json_ld_course_values(
            value
        )
        title = title or child_title
        description = description or child_description
        authors.extend(child_authors)

    return title, description, _dedupe_strings(authors)


def parse_course_page(html: str, listing: MITOCWCourseListing) -> MITOCWCourse:
    soup = BeautifulSoup(html, "html.parser")
    title = listing.title
    description = ""
    authors: list[str] = []

    meta_description = soup.select_one('meta[name="description"]')
    if meta_description and isinstance(meta_description.get("content"), str):
        description = meta_description["content"].strip()

    for script in soup.select('script[type="application/ld+json"]'):
        script_text = script.string
        if not script_text:
            continue
        try:
            payload = json.loads(script_text)
        except json.JSONDecodeError:
            continue
        json_ld_title, json_ld_description, json_ld_authors = (
            _extract_json_ld_course_values(payload)
        )
        title = json_ld_title or title
        description = json_ld_description or description
        authors.extend(json_ld_authors)

    return MITOCWCourse(
        title=title,
        description=description,
        authors=_dedupe_strings(authors),
        subject_tags=_topic_labels(listing),
        source_url=_normalize_course_url(listing.href),
        version_url=_normalize_course_url(listing.href),
    )


async def _fetch_json_list(
    httpx_async_client: httpx.AsyncClient, url: str
) -> list[dict[str, object]]:
    try:
        response = await httpx_async_client.get(url)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        status_code = _status_code_from_http_error(exc)
        msg = (
            f"Failed to fetch MIT OpenCourseWare JSON from {url} "
            f"(Status: {status_code}). {exc!s}"
        )
        raise RuntimeError(msg) from exc
    return response.json()


async def _fetch_text(httpx_async_client: httpx.AsyncClient, url: str) -> str:
    try:
        response = await httpx_async_client.get(url)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        status_code = _status_code_from_http_error(exc)
        msg = (
            f"Failed to fetch MIT OpenCourseWare page {url} "
            f"(Status: {status_code}). {exc!s}"
        )
        raise RuntimeError(msg) from exc
    return response.text


async def fetch_topic_index(
    httpx_async_client: httpx.AsyncClient,
) -> list[MITOCWTopicIndexItem]:
    payload = await _fetch_json_list(httpx_async_client, MIT_OCW_TOPICS_INDEX_URL)
    return [MITOCWTopicIndexItem.model_validate(item) for item in payload]


async def fetch_topic_course_listings(
    httpx_async_client: httpx.AsyncClient, topic_file: str
) -> list[MITOCWCourseListing]:
    payload = await _fetch_json_list(
        httpx_async_client, urljoin(MIT_OCW_TOPIC_URL_PREFIX, topic_file)
    )
    return [MITOCWCourseListing.model_validate(item) for item in payload]


async def _collect_unique_course_listings(
    httpx_async_client: httpx.AsyncClient,
) -> list[MITOCWCourseListing]:
    listings_by_url: dict[str, MITOCWCourseListing] = {}
    for topic in await fetch_topic_index(httpx_async_client):
        topic_listings = await fetch_topic_course_listings(
            httpx_async_client, topic.file
        )
        for listing in topic_listings:
            course_url = _normalize_course_url(listing.href)
            if course_url not in listings_by_url:
                listings_by_url[course_url] = listing.model_copy(deep=True)
                continue
            existing = listings_by_url[course_url]
            existing.topics.extend(listing.topics)
    return sorted(
        listings_by_url.values(), key=lambda listing: listing.title.casefold()
    )


async def fetch_course_details(
    httpx_async_client: httpx.AsyncClient, listing: MITOCWCourseListing
) -> MITOCWCourse:
    html = await _fetch_text(httpx_async_client, _normalize_course_url(listing.href))
    return parse_course_page(html, listing)


async def search_courses(
    query: str = DEFAULT_QUERY,
    limit: int = DEFAULT_LIMIT,
) -> list[MITOCWCourse]:
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=30.0,
    ) as httpx_async_client:
        listings = await _collect_unique_course_listings(httpx_async_client)
        selected: list[MITOCWCourse] = []
        seen_urls: set[str] = set()
        details_cache: dict[str, MITOCWCourse] = {}

        async def get_details(listing: MITOCWCourseListing) -> MITOCWCourse:
            course_url = _normalize_course_url(listing.href)
            if course_url not in details_cache:
                details_cache[course_url] = await fetch_course_details(
                    httpx_async_client, listing
                )
            return details_cache[course_url]

        for require_listing_match in (True, False):
            for listing in listings:
                if require_listing_match and not _listing_matches_query(listing, query):
                    continue
                if not require_listing_match and _listing_matches_query(listing, query):
                    continue
                course = await get_details(listing)
                if course.source_url in seen_urls or not _course_matches_query(
                    course, query
                ):
                    continue
                seen_urls.add(course.source_url)
                selected.append(course)
                if len(selected) >= limit:
                    return selected

    return selected


def bulk_translate(courses: list[dict]) -> Iterator[EducationResource]:
    yield from (plugin.make_metadata_card_from_dict(course) for course in courses)


def bulk_import(
    query: str = DEFAULT_QUERY,
    limit: int = DEFAULT_LIMIT,
    cache_path: Path | None = None,
) -> list[dict]:
    """Fetch MIT OpenCourseWare courses matching a query and return OME cards."""
    if cache_path is None:
        cache_path = (
            Path(__file__).resolve().parent / "mit_opencourseware_python_courses.json"
        )

    if not cache_path.exists():
        courses = asyncio.run(search_courses(query=query, limit=limit))
        cache_path.write_text(
            json.dumps([course.model_dump() for course in courses], indent=2) + "\n"
        )

    courses = [
        MITOCWCourse.model_validate(item).model_dump()
        for item in json.loads(cache_path.read_text())
    ]
    return [card.model_dump() for card in bulk_translate(courses)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent
    results = bulk_import(
        query=DEFAULT_QUERY,
        limit=DEFAULT_LIMIT,
        cache_path=here / "mit_opencourseware_python_courses.json",
    )
    print(json.dumps(results, indent=2))
