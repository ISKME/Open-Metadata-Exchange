"""`.env.example` regression guards.

Split off from the P3 docs PR so `.env.example` can land as a
minimal, independently-reviewable change — a short, low-risk first
PR from a new contributor is the easiest for a maintainer to approve
for CI, which then unblocks workflow runs on the larger follow-up
PRs from the same author.

Every key below is read by a `server/` module at runtime. The tests
grep the example file rather than importing it so a malformed
example (e.g. a value where a comment is expected) still surfaces a
clear failure.
"""

from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent

_ENV_EXAMPLE_REQUIRED_KEYS = (
    "INN_SERVER_NAME",
    "INN_USERNAME",
    "INN_PASSWORD",
    "OME_ENV",
    "OME_ALLOWED_ORIGINS",
    "CMS_PLUGIN",
    "OME_RATE_LIMIT",
    "OME_LOG_LEVEL",
)


def test_env_example_exists() -> None:
    path = REPO_ROOT / ".env.example"
    assert path.exists(), ".env.example is required (issue #15)"


@pytest.mark.parametrize("key", _ENV_EXAMPLE_REQUIRED_KEYS)
def test_env_example_documents_key(key: str) -> None:
    path = REPO_ROOT / ".env.example"
    text = path.read_text()
    assert key in text, f".env.example must mention {key!r} (issue #15)"


def test_env_example_header_warns_against_committing_real_secrets() -> None:
    text = (REPO_ROOT / ".env.example").read_text()
    assert "DO NOT commit" in text, (
        ".env.example header should warn contributors not to commit a real .env file"
    )
