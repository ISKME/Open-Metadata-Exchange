#!/usr/bin/env python3

"""
Functions for building NNTP articles (RFC 5322 email messages) that carry
OME metadata as MIME enclosures.

Public API:
    nntp_article()       — low-level builder: title + arbitrary JSON attachments.
    make_plugin_article() — high-level helper: plugin + raw item JSON → article.
"""

from __future__ import annotations

from collections.abc import Iterable
from email.message import EmailMessage
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server.plugins.ome_plugin import OMEPlugin


def nntp_article(
    title: str, attachments: Iterable[str | Path], *, body: str = ""
) -> EmailMessage:
    """
    Returns an NNTP article (EmailMessage) with the given subject, optional body text,
    and JSON file attachments (enclosures).

    Args:
        title: The article subject line.
        attachments: Paths to JSON files to attach as NNTP enclosures.
        body: Optional plain-text body for the article (e.g., serialised OME JSON).
    """
    msg = EmailMessage()
    msg["Subject"] = title
    if body:
        msg.set_content(body)
    # Iterate over the attachments and add them to the email
    for attachment in attachments:
        if not (path := Path(attachment)).exists():
            err_msg = FileNotFoundError(f"Attachment {attachment} does not exist.")
            raise err_msg
        if path.suffix != ".json":
            err_msg = ValueError(f"Attachment {attachment} is not a JSON file.")
            raise err_msg
        msg.add_attachment(
            path.read_bytes(),
            maintype="application",
            subtype="json",
            filename=path.name,
        )

    return msg


def make_plugin_article(
    plugin: OMEPlugin,
    item_json_path: str | Path,
    *,
    ome_json_path: str | Path | None = None,
) -> EmailMessage:
    """
    Build an NNTP article from a plugin and a raw source-item JSON file.

    This is a convenience wrapper around :func:`nntp_article` that handles
    the boilerplate required to turn a raw source JSON record into a
    publishable NNTP article:

    1. Reads *item_json_path* and calls ``plugin.make_metadata_card_from_json()``
       to produce an :class:`~server.plugins.ome_plugin.EducationResource`.
    2. Serialises the resource to JSON and writes it to *ome_json_path*
       (``<stem>_ome_item.json`` in the same directory by default).
    3. Calls :func:`nntp_article` with:
       - body  = the OME JSON string
       - first attachment  = the raw source-item JSON file
       - second attachment = the OME JSON file

    Args:
        plugin: The :class:`~server.plugins.ome_plugin.OMEPlugin` subclass
            instance to use for the metadata transformation.
        item_json_path: Path to the raw source-item JSON file
            (e.g. ``eric_item.json``).
        ome_json_path: Optional explicit path for the OME JSON output file.
            When omitted the path is derived by replacing the ``_item``
            suffix of *item_json_path*'s stem with ``_ome_item``
            (e.g. ``eric_item.json`` → ``eric_ome_item.json``).

    Returns:
        An :class:`email.message.EmailMessage` ready to be posted to INN
        or written to disk with ``Path(...).write_text(str(article))``.

    Example::

        from pathlib import Path
        from server.nntp_article import make_plugin_article
        from server.plugins.eric.plugin import EricPlugin

        plugin = EricPlugin()
        here = Path(__file__).resolve().parent
        article = make_plugin_article(plugin, here / "eric_item.json")
        (here / "eric_article.eml").write_text(str(article))
    """
    item_path = Path(item_json_path)

    if ome_json_path is None:
        stem = item_path.stem  # e.g. "eric_item"
        _item_suffix = "_item"
        ome_stem = (
            f"{stem[: -len(_item_suffix)]}_ome_item"
            if stem.endswith(_item_suffix)
            else f"{stem}_ome"
        )
        ome_path = item_path.parent / f"{ome_stem}.json"
    else:
        ome_path = Path(ome_json_path)

    ome_resource = plugin.make_metadata_card_from_json(item_path.read_text())
    ome_json = ome_resource.model_dump_json(indent=2)
    ome_path.write_text(ome_json + "\n")

    return nntp_article(
        title=ome_resource.title,
        attachments=[item_path, ome_path],
        body=ome_json,
    )


if __name__ == "__main__":
    here = Path(__file__).parent
    article = nntp_article(title="Example Article", attachments=here.glob("*.json"))
    Path(here / "example_article.eml").write_text(str(article))
    # print(article)
    print(f"Subject: {article['Subject']}")
    for attachment in article.iter_attachments():
        print(f"Attachment: {attachment.get_filename()}")
        print(f"Content-Type: {attachment.get_content_type()}")
        print(f"Content-Disposition: {attachment.get('Content-Disposition')}")
