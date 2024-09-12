from datetime import datetime
from pydantic import BaseModel


class EducationResource(BaseModel):
    """
    The metadata for an education resource to be communicated in the Exchange.  This
    could be a lesson plan, one or more datasets, documents, worksheets, images, or
    videos.
    The resource contains a title, description, author, authoring institution, a list
    of subject tags, a creation date, last modified date, and usage information.
    """

    # from pedigree_record import PedigreeRecord

    title: str = ""
    description: str = ""
    author: str = ""
    authoring_institution: str = ""
    subject_tags: list[str] = []
    creation_date: datetime | None = None
    last_modified_date: datetime | None = None
    usage_comments: list[str] = []  # list[PedigreeRecord] = []
