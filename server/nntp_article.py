#!/usr/bin/env python3

"""
A function that returns an nntp_article that contains a tuple of attachments that are
json files.
"""

from __future__ import annotations

from email.message import EmailMessage
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import Iterable


def nntp_article(title: str, attachments: Iterable[str | Path]) -> EmailMessage:
    """
    Returns a tuple of paths to two JSON files.
    """
    msg = EmailMessage()
    msg["Subject"] = title
    # Iterate over the attachments and add them to the email
    for attachment in attachments:
        path = Path(attachment)
        if not path.exists():
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
