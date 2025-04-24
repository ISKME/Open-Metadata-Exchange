#!/usr/bin/env -S uv run --script

# /// script
# requires-python = "==3.12"
# dependencies = [
#     "pynntp",
# ]
# ///

import datetime
import nntplib  # Removed from the Python standard library in 3.12

import nntp

# This includes newly created newsgroups.
nntplib_client = nntplib.NNTP("localhost")
for group_info in nntplib_client.newgroups(datetime.date(1970, 1, 1))[1]:
    print(f"{group_info=}")
print("-" * 20)

# This does NOT include newly created newsgroups!
pynntp_client = nntp.NNTPClient("localhost")
for name, description in sorted(pynntp_client.list_newsgroups()):
    print(f"{name=:<20}: {description=}")
