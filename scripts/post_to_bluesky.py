#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.15"
# dependencies = [
#     "atproto",
# ]
# ///


import os
from datetime import UTC, datetime

from atproto import Client


def main() -> None:
    handle = os.environ["BLUESKY_HANDLE"]
    password = os.environ["BLUESKY_PASSWORD"]

    # Current date and time in UTC
    now = datetime.now(UTC)
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S UTC")

    message = f"Hello Bluesky! Today's date and time: {timestamp}"

    atproto_client = Client()
    atproto_client.login(handle, password)

    post = atproto_client.send_post(text=message)

    print(f"Successfully posted: {message}")
    print(f"Post URI: {post.uri}")


if __name__ == "__main__":
    main()
