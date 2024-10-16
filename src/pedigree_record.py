from datetime import datetime

from pydantic import BaseModel

from .education_resource import EducationResource


class PedigreeRecord(BaseModel):
    """
    Track information about who is using an edcuation resource from the Exchange so we
    gather statistics about usage and customization.  This will enable content creators
    measure the impact of their work and gather comments that may lead to improvement
    or collaboration with other interested parties.

        Attributes:
        education_resource: Description of education_resource
        borrower: Description of borrower
        borrower_institution: Description of borrower_institution
        date_borrowed: Description of date_borrowed
        refreshed_dates: Description of refreshed_dates
        usage_comments: Description of usage_comments
    """

    education_resource: EducationResource
    borrower: str
    borrower_institution: str
    date_borrowed: datetime
    refreshed_dates: list[datetime]
    usage_comments: list[str]
