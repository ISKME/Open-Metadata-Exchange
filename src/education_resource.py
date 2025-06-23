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
        author: Description of author
        authoring_institution: Description of authoring_institution
        subject_tags: Description of subject_tags
        creation_date: Description of creation_date
        last_modified_date: Description of last_modified_date
        usage: Description of usage
    """

    from .pedigree_record import PedigreeRecord  # noqa: PLC0415 Avoid circular imports

    title: str = ""
    description: str = ""
    author: str = ""
    authoring_institution: str = ""
    subject_tags: list[str] = []
    creation_date: datetime | None = None
    last_modified_date: datetime | None = None
    usage: list[PedigreeRecord] = []
