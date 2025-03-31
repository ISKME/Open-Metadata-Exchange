from pathlib import Path

import pytest

from server.nntp_article import nntp_article

here = Path(__file__).parent


@pytest.mark.parametrize(
    ("title", "attachments"),
    [
        ("Article with no attachments", []),
        ("Article with one attachment", [here / "file1.json"]),
        ("Article with two attachments", [here / "file1.json", here / "file2.json"]),
    ],
)
def test_nntp_article(title: str, attachments: Path) -> None:
    """
    Test the nntp_article function.
    """
    msg = nntp_article(title, attachments)
    assert msg["Subject"] == title
    for i, attachment in enumerate(attachments):
        path = Path(attachment)
        assert path.exists()
        assert path.suffix == ".json"
        assert msg.get_payload(i).get_filename() == path.name
        assert msg.get_payload(i).get_content_type() == "application/json"
        assert (
            msg.get_payload(i).get("Content-Disposition")
            == f'attachment; filename="{path.name}"'
        )
    if count := len(attachments):
        assert count == i + 1, f"Expected {count} attachments, but got {i + 1}"


def test_nntp_article_invalid_attachment() -> None:
    """
    Test the nntp_article function with an invalid attachment.
    """
    path = here / "does_not_exist.json"
    with pytest.raises(FileNotFoundError, match=f"Attachment {path} does not exist."):
        nntp_article("Test Article", [path])

    path = here / "not_a_json_file.txt"
    with pytest.raises(ValueError, match=f"Attachment {path} is not a JSON file."):
        nntp_article("Test Article", [path])
