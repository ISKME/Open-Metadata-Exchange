#!/usr/bin/env -S uv run --script

# Source: https://www.oerafrica.org/search/site?search_api_views_fulltext=Milk&_format=json
# Docs:   https://www.oerafrica.org/jsonapi

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///
#
# Generated with command:
# uv tool run --from=datamodel-code-generator datamodel-codegen \
#             --input oer_africa_item.json --input-file-type json \
#             --output oer_africa_models.py

from pydantic import BaseModel, Field


class Body(BaseModel):
    value: str = Field(default="", description="Full HTML body text.")
    summary: str = Field(default="", description="Plain-text summary or abstract.")


class InstitutionMeta(BaseModel):
    drupal_internal__target_id: int = Field(default=0)


class InstitutionData(BaseModel):
    type: str = Field(default="")
    id: str = Field(default="")


class InstitutionRelationship(BaseModel):
    data: InstitutionData = Field(default_factory=InstitutionData)
    meta: InstitutionMeta = Field(default_factory=InstitutionMeta)


class PersonData(BaseModel):
    type: str = Field(default="")
    id: str = Field(default="")


class AuthorsRelationship(BaseModel):
    data: list[PersonData] = Field(default_factory=list)


class Relationships(BaseModel):
    field_institution: InstitutionRelationship = Field(
        default_factory=InstitutionRelationship
    )
    field_authors: AuthorsRelationship = Field(default_factory=AuthorsRelationship)


class ResourceMeta(BaseModel):
    drupal_internal__nid: int = Field(default=0)
    field_institution_title: str = Field(default="")
    field_authors_names: list[str] = Field(default_factory=list)


class Attributes(BaseModel):
    drupal_internal__nid: int = Field(default=0)
    status: bool = Field(default=True)
    title: str = Field(default="")
    body: Body = Field(default_factory=Body)
    created: str = Field(default="")
    changed: str = Field(default="")
    field_license: str = Field(default="")
    field_subjects: list[str] = Field(default_factory=list)
    field_language: str = Field(default="")
    field_url: str = Field(default="")


class OERAFricaResource(BaseModel):
    """
    Represents a single OER Africa resource as returned by the Drupal JSON:API endpoint
    https://www.oerafrica.org/jsonapi/node/resource
    """

    id: str = Field(default="")
    type: str = Field(default="node--resource")
    attributes: Attributes = Field(default_factory=Attributes)
    relationships: Relationships = Field(default_factory=Relationships)
    meta: ResourceMeta = Field(default_factory=ResourceMeta)


if __name__ == "__main__":
    from pathlib import Path

    here = Path(__file__).parent
    json_path = here / "oer_africa_item.json"
    resource = OERAFricaResource.model_validate_json(json_path.read_text())
    print(f"{resource.attributes.title = }")
    print(f"{resource.meta.field_authors_names = }")
    print(f"{resource.meta.field_institution_title = }")
    print(f"{resource.attributes.field_subjects = }")
    print(f"{resource.attributes.field_license = }")
