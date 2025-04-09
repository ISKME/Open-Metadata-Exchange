#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///

from datetime import datetime

from pydantic import BaseModel

from server.oercommons_models import Model as OERCommonsModel

# from server.openlibrary_work_models import Model as OpenLibraryWorkModel
# from server.openlibrary_authors_models import Model as OpenLibraryAuthorsModel


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
    authors: list[str] = ""
    authoring_institution: str = ""
    subject_tags: list[str] = []
    creation_date: datetime | None = None
    last_modified_date: datetime | None = None
    source_url: str = ""


def oercommonts_to_metadata_card(oercommons_item: OERCommonsModel) -> EducationResource:
    """
    Convert an OERCommonsModel item to an EducationResource.
    """
    oercommons_item = oercommons_item.field_source
    return EducationResource(
        title=oer_commons_item.title,
        description=oer_commons_item.text,
        authors=oer_commons_item.authors,
        authoring_institution=oer_commons_item.provider_name,
        subject_tags=oer_commons_item.keywords_names,
        creation_date=oer_commons_item.published_on,
        last_modified_date=oer_commons_item.modified_timestamp,
    )


if __name__ == "__main__":
    from pathlib import Path

    # The oercommons.json file should be in the same directory as this script.
    json_path = Path(__file__).parent / "oercommons.json"
    oer_commons_item = OERCommonsModel.model_validate_json(json_path.read_text())
    education_resource = oercommonts_to_metadata_card(oer_commons_item)
    print(education_resource)
    print()

    """
    json_path = Path(__file__).parent / "openlibrary_work.json"
    open_library_work = OpenLibraryWorkModel.model_validate_json(json_path.read_text())
    education_resource = EducationResource(
        title=open_library_work.title,
        description=open_library_work.description,
        authors=open_library_work.author,
        authoring_institution=open_library_work.authoring_institution,
        subject_tags=open_library_work.subject_tags,
        creation_date=open_library_work.creation_date,
        last_modified_date=open_library_work.last_modified_date,
    )
    print(education_resource.json(indent=2))
    """
