All community interactions should be aligned with our Code of Conduct.

We appreciate your interest in this project and look forward to collaborating around
respecful issues and pull requests.

To isolate this project from other projects that use Python, we encourage you to create
a [`venv`](https://docs.python.org/3/library/venv.html) with the commands:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --editable .
```

We use [`pre-commit`](https://pre-commit.com/) to format, lint, and test files in this
project so we strongly encourage contributors to:
```bash
pipx install pre-commit  # or brew install pre-commit
pre-commit install
```

This project requires that a current version of `Docker Desktop` is properly installed.
