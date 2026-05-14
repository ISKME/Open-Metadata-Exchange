#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from pydantic import BaseModel, ConfigDict, Field


class MITOCWTopicIndexItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    file: str


class MITOCWTopicTag(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    sub_cat: str = Field(default="", alias="subCat")
    speciality: str = ""


class MITOCWCourseListing(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str | int = ""
    title: str
    href: str
    topics: list[MITOCWTopicTag] = Field(default_factory=list)
    textbooks: bool | None = None


class MITOCWCourse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str
    description: str = ""
    authors: list[str] = Field(default_factory=list)
    authoring_institution: str = "MIT OpenCourseWare"
    subject_tags: list[str] = Field(default_factory=list)
    source_url: str
    version_url: str = ""
    spdx_license_expression: str = "CC-BY-NC-SA-4.0"
