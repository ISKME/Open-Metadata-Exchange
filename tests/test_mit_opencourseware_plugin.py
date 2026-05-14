import asyncio
import json
from pathlib import Path

import pytest

from server.plugins.mit_opencourseware.bulk_import import (
    MITOCWCourse,
    MITOCWCourseListing,
    bulk_import,
    parse_course_page,
    search_courses,
)
from server.plugins.mit_opencourseware.mit_opencourseware_models import MITOCWTopicTag
from server.plugins.mit_opencourseware.plugin import MITOpenCourseWarePlugin

MIT_OCW_DIR = Path(__file__).parent.parent / "server" / "plugins" / "mit_opencourseware"


@pytest.fixture
def sample_listing() -> MITOCWCourseListing:
    return MITOCWCourseListing(
        id="6.0001",
        title="Introduction to Computer Science and Programming in Python",
        href="/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/",
        topics=[MITOCWTopicTag(subCat="Computer Science", speciality="Python")],
    )


def test_mit_opencourseware_plugin_attributes() -> None:
    plugin = MITOpenCourseWarePlugin()
    assert plugin.mimetypes == ("application/vnd.mit.opencourseware.course+json",)
    assert "ome.mit_opencourseware" in plugin.newsgroups
    assert plugin.newsgroups["ome.mit_opencourseware"] == (
        "Metadata from MIT OpenCourseWare courses https://ocw.mit.edu"
    )


def test_make_metadata_card_from_json() -> None:
    plugin = MITOpenCourseWarePlugin()
    card = plugin.make_metadata_card_from_json(
        (MIT_OCW_DIR / "mit_opencourseware_item.json").read_text()
    )
    assert card.title == "Introduction to Computer Science and Programming in Python"
    assert card.authoring_institution == "MIT OpenCourseWare"
    assert card.spdx_license_expression == "CC-BY-NC-SA-4.0"


def test_parse_course_page_extracts_json_ld_and_meta_description(
    sample_listing: MITOCWCourseListing,
) -> None:
    html = """
    <html>
      <head>
        <meta
          name="description"
          content="Learn Python for computational problem solving."
        />
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Introduction to Computer Science and Programming in Python",
          "description": "Learn Python for computational problem solving.",
          "instructor": [
            {"@type": "Person", "name": "Eric Grimson"},
            {"@type": "Person", "name": "John Guttag"}
          ]
        }
        </script>
      </head>
    </html>
    """

    course = parse_course_page(html, sample_listing)

    assert course.title == sample_listing.title
    assert course.description == "Learn Python for computational problem solving."
    assert course.authors == ["Eric Grimson", "John Guttag"]
    assert "Computer Science" in course.subject_tags
    assert "Python" in course.subject_tags


def test_search_courses_prefers_listing_matches_and_limits_results(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    listings = [
        MITOCWCourseListing(
            id=str(index),
            title=f"Python Course {index:02d}",
            href=f"/courses/python-course-{index:02d}/",
            topics=[MITOCWTopicTag(subCat="Computer Science", speciality="Python")],
        )
        for index in range(60)
    ]

    async def fake_collect_unique_course_listings(
        _httpx_async_client: object,
    ) -> list[MITOCWCourseListing]:
        return listings

    async def fake_fetch_course_details(
        _httpx_async_client: object, listing: MITOCWCourseListing
    ) -> MITOCWCourse:
        return MITOCWCourse(
            title=listing.title,
            description="A Python-focused MIT course.",
            authors=["MIT Faculty"],
            subject_tags=["Computer Science", "Python"],
            source_url=f"https://ocw.mit.edu{listing.href}",
            version_url=f"https://ocw.mit.edu{listing.href}",
        )

    monkeypatch.setattr(
        "server.plugins.mit_opencourseware.bulk_import._collect_unique_course_listings",
        fake_collect_unique_course_listings,
    )
    monkeypatch.setattr(
        "server.plugins.mit_opencourseware.bulk_import.fetch_course_details",
        fake_fetch_course_details,
    )

    courses = asyncio.run(search_courses(query="python", limit=50))

    assert len(courses) == 50
    assert all("Python" in course.title for course in courses)


def test_bulk_import_writes_cache_and_translates_cards(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    expected_courses = [
        MITOCWCourse(
            title=f"Python Course {index:02d}",
            description="A Python MIT OCW course.",
            authors=["MIT Faculty"],
            subject_tags=["Computer Science", "Python"],
            source_url=f"https://ocw.mit.edu/courses/python-course-{index:02d}/",
            version_url=f"https://ocw.mit.edu/courses/python-course-{index:02d}/",
        )
        for index in range(50)
    ]

    async def fake_search_courses(query: str, limit: int) -> list[MITOCWCourse]:
        assert query == "python"
        assert limit == 50
        return expected_courses

    cache_path = tmp_path / "mit_opencourseware_python_courses.json"
    monkeypatch.setattr(
        "server.plugins.mit_opencourseware.bulk_import.search_courses",
        fake_search_courses,
    )

    cards = bulk_import(cache_path=cache_path)

    assert cache_path.exists()
    assert len(json.loads(cache_path.read_text())) == 50
    assert len(cards) == 50
    assert cards[0]["title"] == "Python Course 00"
    assert cards[0]["authoring_institution"] == "MIT OpenCourseWare"
