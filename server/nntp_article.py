#!/usr/bin/env python3

"""
A function that returns an nntp_article that contains a tuple of attachments that are
json files.
"""

from collections.abc import Iterable
from email.message import EmailMessage
from pathlib import Path


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
