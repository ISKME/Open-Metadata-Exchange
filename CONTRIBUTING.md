# Contributing
All community interactions should be aligned with our Code of Conduct.

We appreciate your interest in this project and look forward to collaborating around
respecful issues and pull requests.

The repository uses three tools that contributors will need to interact with:
1. [`uv`](https://docs.astral.sh/uv): Python package and project manager
2. [`pre-commit`](https://pre-commit.com): Framework for pre-commit hooks
3. [`Docker Desktop`](https://www.docker.com/products/docker-desktop): Containerization software

## uv
To isolate this project from other projects that use Python, we encourage you to create
a [`venv`](https://docs.python.org/3/library/venv.html) with the commands:
```bash
uv --python=3.12 venv
source .venv/bin/activate
uv pip install --upgrade pip
pip install --editable .
```
Python <= 3.12 is required a bug in pynntp .list_newsgroups().

## pre-commit
We use [`pre-commit`](https://pre-commit.com) to format, lint, and test files in this
project so we strongly encourage contributors to:
```bash
uv tool install pre-commit  # or brew install pre-commit
pre-commit install
```

## Docker Desktop
This project requires that a current version of `Docker Desktop` is properly installed.

## Starting from scratch
Start by creating your own `fork` of the `Open-Metadata-Exchange` GitHub repository.
Substitute your GitHub username in the steps below: `<your_GitHub_username>`
* Go to https://github.com/<your_GitHub_username>/Open-Metadata-Exchange.
* If that page already exists then you already have your own fork.
* If that page does not exist, go to https://github.com/ISKME/Open-Metadata-Exchange and click the `Fork` button in the upper right of the page.

Now let's switch to your terminal to create a local directory where you can make changes and submit those changes as pull requests.
* `git clone https://github.com/<your_GitHub_username>/Open-Metadata-Exchange` will make a local copy of your fork.  Make sure you use `<your_GitHub_username>`!!
* `cd Open-Metadata-Exchange`  # Going inside this new directory is important.
* `git remote add upstream https://github.com/ISKME/Open-Metadata-Exchange`  Make sure you use `ISKME`.
* `git remote -v` to ensure that `origin` is your fork and that `upstream` is the ISKME repo.

% `git remote -v`  # Should look like this…
```
origin	https://github.com/<your_GitHub_username>/Open-Metadata-Exchange (fetch)
origin	https://github.com/<your_GitHub_username>/Open-Metadata-Exchange (push)
upstream	https://github.com/ISKME/Open-Metadata-Exchange (fetch)
upstream	https://github.com/ISKME/Open-Metadata-Exchange (push)
```
Now you can make changes to your fork (origin) and then push those changes to ISKME (upstream) for review.
```
git checkout -b branch_for_my_changes
<make some changes>
git push
```

You should perform the `pre-commit` steps above to ensure some local testing before your work gets reviewed.
