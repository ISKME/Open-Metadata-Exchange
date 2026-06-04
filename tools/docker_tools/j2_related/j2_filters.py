#!/bin/env python3

import subprocess


def passwd_hash(password: str) -> str:
    return subprocess.getoutput(f"openssl passwd -5 {password}")  # noqa: S605
