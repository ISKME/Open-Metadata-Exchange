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
uv --python=3.13 venv
source .venv/bin/activate
uv pip install --upgrade pip
pip install --editable .
```

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

## Local environment

Copy `.env.example` to `.env` and fill in the blanks. Every variable
read by the server is documented inline in `.env.example`. Docker
Compose picks `.env` up automatically; if you run `server/` directly,
export the variables in your shell first.

## Installing dependencies

Use `uv`. The first time you clone the repo, run:

```bash
uv sync          # resolve + install runtime + dev deps into .venv
```

`uv sync` is the canonical install command and is what CI runs. Do
not hand-manage `pip install` once you have `uv` configured.

## Running tests

```bash
uv run pytest                     # full offline suite
uv run pytest tests/test_p0_*     # a single file (fastest feedback loop)
uv run pytest -k rate_limit       # by keyword
uv run pytest --cov=server        # with coverage — CI gates at 50 %
```

Tests that require a live INN server are auto-skipped when none is
reachable (`tests/conftest.py`). In CI they run against the
`cclauss/inn` Docker service declared in `.github/workflows/ci.yml`.

## Plugin development

Every OME site (OER Commons, LOUIS, Internet Archive, …) is a plugin.
Start with the contract in [`server/plugins/README.md`](server/plugins/README.md)
and the per-plugin READMEs under each `server/plugins/<name>/`.

Minimal quickstart:

```bash
mkdir server/plugins/mysite
touch server/plugins/mysite/__init__.py
touch server/plugins/mysite/plugin.py
```

Subclass `server.plugins.ome_plugin.OMEPlugin` in `plugin.py` and
override `make_metadata_card_from_url`, `make_metadata_card_from_json`,
and `summarize`. The loader (`server/get_ome_plugins.py`) calls
`validate_plugin()` at startup, so a missing or mismatched
`plugin_api_version` will fail fast.

Point the server at your plugin with:

```bash
export CMS_PLUGIN=server.plugins.mysite.plugin.MySitePlugin
uv run uvicorn server.main:app --reload --port 5001
```

## API docs

With the server running, interactive API docs are available at:

* Swagger UI — `http://localhost:5001/docs`
* ReDoc — `http://localhost:5001/redoc`
* Raw OpenAPI schema — `http://localhost:5001/openapi.json`

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `ImportError` on `server.connection_pool` at startup | `INN_USERNAME` / `INN_PASSWORD` unset. See `.env.example`. |
| FastAPI returns 500 with `ResponseValidationError` | Route response annotation doesn't match what the handler returns. |
| `403` from the browser but the API works in `curl` | `OME_ALLOWED_ORIGINS` doesn't include your frontend origin. In dev, set `OME_ENV=dev`. |
| `docker compose build` fails on the frontend stage | See ISKME#263 for the canonical fix. |
| Tests hang for minutes | An NNTP-touching test thinks a server is available. Check `tests/conftest.py` skip logic. |
| `validate_plugin` raises `InvalidPluginError` | Your plugin's `plugin_api_version` doesn't share a major with `CURRENT_PLUGIN_API_VERSION`. Update the plugin. |
