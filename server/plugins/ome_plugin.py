#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pydantic",
# ]
# ///
"""Plugin interface for OME (issue #8).

Two plugin shapes are supported:

* :class:`OMEPlugin` — the concrete base class. Subclass this to pick
  up sensible defaults (mimetypes, newsgroups, contact info) and the
  ``plugin_api_version`` attribute.
* :class:`OMEPluginProtocol` — a ``typing.Protocol`` describing the
  duck-typed contract. Useful for type-checking third-party plugins
  that do not want to import the concrete base.

Plugins are validated at load time by :func:`validate_plugin`, called
from :func:`server.get_ome_plugins._load_plugin`. Plugins that fail
validation raise :class:`InvalidPluginError` so the server fails fast
rather than limping along with a subtly broken plugin.
"""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime
from types import MappingProxyType
from typing import Any, Protocol, runtime_checkable

from pydantic import BaseModel

# Bump the **major** when a breaking change to the plugin contract
# lands. Plugins whose `plugin_api_version` does not share a major with
# this constant are rejected by :func:`validate_plugin`.
CURRENT_PLUGIN_API_VERSION = "1.0"


class InvalidPluginError(RuntimeError):
    """Raised when a plugin fails the load-time validation contract."""


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
        source_url: Permanent URL where the resource can be found
        version_url: URL where this version of the resource can be found
        spdx_license_expression: License using SPDX standard https://spdx.org/licenses
        # TBD: usage: Description of usage
    """

    title: str = ""
    description: str = ""
    authors: list[str] = []
    authoring_institution: str = ""
    subject_tags: list[str] = []
    creation_date: datetime | None = None
    last_modified_date: datetime | None = None
    source_url: str = ""
    version_url: str = ""
    spdx_license_expression: str = ""


@runtime_checkable
class OMEPluginProtocol(Protocol):
    """Structural contract every OME plugin must satisfy.

    The concrete :class:`OMEPlugin` base class matches this protocol;
    external plugins may also satisfy it by duck-typing.
    """

    plugin_api_version: str
    mimetypes: tuple[str, ...]
    newsgroups: Mapping[str, str]
    site_name: str
    librarian_contact: str
    logo: str

    def summarize(self, card: EducationResource) -> str: ...

    def make_metadata_card_from_url(self, url: str) -> EducationResource: ...

    def make_metadata_card_from_json(
        self, json_payload: str
    ) -> EducationResource: ...


class OMEPlugin:
    """Concrete base class for OME plugins.

    Subclasses inherit sensible defaults and the contractually required
    ``plugin_api_version``. Override the three ``make_*`` / ``summarize``
    methods to implement a real plugin. Methods that are not overridden
    continue to raise ``NotImplementedError`` so missing work surfaces
    clearly rather than returning silently-empty data.
    """

    plugin_api_version: str = CURRENT_PLUGIN_API_VERSION

    mimetypes: tuple[str, ...] = ()
    # Immutable default for safety (ruff RUF012). A future `OMESite`
    # abstraction is tracked separately; for now every plugin declares
    # its own site-flavored attributes. The `Mapping` annotation is
    # compatible with both real dicts and `MappingProxyType` so every
    # existing subclass still satisfies the contract without changes.
    newsgroups: Mapping[str, str] = MappingProxyType({})

    site_name: str = "Generic OME Library"
    librarian_contact: str = "info@iskme.org"
    logo: str = (
        "https://louis.oercommons.org/static/newdesign/images/louis/oerx-logo.png"
    )

    def summarize(self, card: EducationResource) -> str:
        msg = "Not implemented yet."
        raise NotImplementedError(msg)

    def make_metadata_card_from_url(self, url: str) -> EducationResource:
        """Placeholder; subclasses must override."""
        msg = "This method is not implemented yet."
        raise NotImplementedError(msg)

    def make_metadata_card_from_json(self, json_payload: str) -> EducationResource:
        """Placeholder; subclasses must override."""
        msg = "This method is not implemented yet."
        raise NotImplementedError(msg)


def _major(version: str) -> str:
    major, _, _ = version.partition(".")
    return major


def validate_plugin(plugin: Any) -> None:
    """Validate a plugin instance against the current contract.

    Raises :class:`InvalidPluginError` for any of:

    * No ``plugin_api_version`` attribute.
    * ``plugin_api_version`` major does not match
      :data:`CURRENT_PLUGIN_API_VERSION`.
    """
    version = getattr(plugin, "plugin_api_version", None)
    if not version:
        raise InvalidPluginError(
            f"{type(plugin).__name__} is missing 'plugin_api_version'. "
            f"Set it to {CURRENT_PLUGIN_API_VERSION!r} or inherit from "
            "OMEPlugin."
        )
    if _major(version) != _major(CURRENT_PLUGIN_API_VERSION):
        raise InvalidPluginError(
            f"{type(plugin).__name__} declares plugin_api_version={version!r}, "
            f"incompatible with current plugin API "
            f"version {CURRENT_PLUGIN_API_VERSION!r}."
        )
