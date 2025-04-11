#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///
from datetime import datetime

from pydantic import BaseModel


class EducationResource(BaseModel):
    """
    The metadata for an education resource to be communicated in the Exchange.  This
    could be a lesson plan, one or more datasets, documents, worksheets, images, or
    videos.

    Attributes:
        title: Description of title
        description: Description of description
        authors: Description of author
        authoring_institution: Description of authoring_institution
        subject_tags: Description of subject_tags
        creation_date: Description of creation_date
        last_modified_date: Description of last_modified_date
        usage: Description of usage
    """

    # from .pedigree_record import PedigreeRecord

    title: str = ""
    description: str = ""
    authors: list[str] = []
    authoring_institution: str = ""
    subject_tags: list[str] = []
    creation_date: datetime | None = None
    last_modified_date: datetime | None = None
    source_url: str = ""


class OMEPlugin:
    """
    This class is a placeholder for the OMEPlugin functionality.
    It is currently empty and does not implement any specific methods or properties.
    """

    mimetypes: tuple[str, ...] = ()

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """
        This method is a placeholder for creating a metadata card.
        It currently does not implement any functionality.
        """
        msg = "This method is not implemented yet."
        raise NotImplementedError(msg)

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """
        This method is a placeholder for creating a metadata card from JSON.
        It currently does not implement any functionality.
        """
        msg = "This method is not implemented yet."
        raise NotImplementedError(msg)

    # def make_nntp_article(self, file_path: str) -> EducationResource:
