"""Issue #14 + #15 — documentation guards.

* Every ``server/plugins/<name>/`` directory has a ``README.md``
  so contributors have a per-plugin reference.
* ``.env.example`` documents every env var the server reads at runtime,
  including the P1 additions (``OME_RATE_LIMIT``, ``OME_LOG_LEVEL``).
* ``CONTRIBUTING.md`` covers: running tests, plugin development,
  troubleshooting.
* The top-level ``README.md`` points contributors at Swagger/OpenAPI
  (``/docs``).
* FastAPI's auto-generated ``/docs`` and ``/openapi.json`` endpoints
  are reachable so consumers actually get an API contract.

These are grep-level regression guards. They are intentionally loose
(no prose-quality checks) but catch the common failure mode of a
plugin dir silently lacking docs.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).parent.parent


# ---------- per-plugin READMEs (issue #14) ----------


def _plugin_dirs() -> list[Path]:
    plugins = REPO_ROOT / "server" / "plugins"
    return [
        p for p in sorted(plugins.iterdir())
        if p.is_dir()
        and (p / "plugin.py").exists()
    ]


@pytest.mark.parametrize(
    "plugin_dir",
    _plugin_dirs(),
    ids=lambda p: p.name,
)
def test_plugin_directory_has_readme(plugin_dir: Path) -> None:
    readme = plugin_dir / "README.md"
    assert readme.exists(), (
        f"{plugin_dir.name} plugin is missing README.md — issue #14 "
        "requires a per-plugin reference (data source, auth, schema "
        "notes)."
    )
    text = readme.read_text(encoding="utf-8")
    # Must not be a one-liner stub.
    assert len(text.strip()) >= 120, (
        f"{plugin_dir.name}/README.md is too short to be useful"
    )


# ---------- .env.example (issue #15) ----------


_ENV_EXAMPLE_REQUIRED_KEYS = (
    # From P0 work
    "INN_SERVER_NAME",
    "INN_USERNAME",
    "INN_PASSWORD",
    "OME_ENV",
    "OME_ALLOWED_ORIGINS",
    "CMS_PLUGIN",
    # From P1 work — must be documented now
    "OME_RATE_LIMIT",
    "OME_LOG_LEVEL",
)


@pytest.mark.parametrize("key", _ENV_EXAMPLE_REQUIRED_KEYS)
def test_env_example_documents_key(key: str) -> None:
    path = REPO_ROOT / ".env.example"
    assert path.exists(), ".env.example is required (issue #15)"
    text = path.read_text(encoding="utf-8")
    assert key in text, f".env.example must mention {key!r} (issue #15)"


# ---------- CONTRIBUTING.md (issue #15) ----------


_CONTRIBUTING_REQUIRED_SECTIONS = (
    # case-insensitive substring checks on the rendered doc
    "uv sync",
    "pytest",
    "plugin",  # plugin development guidance
    "troubleshoot",  # troubleshooting tips
)


@pytest.mark.parametrize("needle", _CONTRIBUTING_REQUIRED_SECTIONS)
def test_contributing_covers_topic(needle: str) -> None:
    path = REPO_ROOT / "CONTRIBUTING.md"
    assert path.exists(), "CONTRIBUTING.md missing"
    text = path.read_text(encoding="utf-8").lower()
    assert needle.lower() in text, (
        f"CONTRIBUTING.md must cover {needle!r} (issue #15)"
    )


# ---------- Top-level README (issue #14) ----------


def test_top_readme_links_to_swagger_docs() -> None:
    path = REPO_ROOT / "README.md"
    text = path.read_text(encoding="utf-8").lower()
    # Accept either the path or the words "swagger"/"openapi".
    assert "/docs" in text or "swagger" in text or "openapi" in text, (
        "README.md must point consumers at the auto-generated API "
        "docs (issue #14)"
    )


# ---------- Swagger/OpenAPI endpoints live (issue #14) ----------


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("OME_ENV", "dev")
    monkeypatch.setenv("OME_ALLOWED_ORIGINS", "https://ui.example.test")
    # Reload to pick up env.
    import importlib

    import server.main as main_mod

    importlib.reload(main_mod)
    return TestClient(main_mod.app)


def test_openapi_json_is_reachable(client: TestClient) -> None:
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    body = resp.json()
    assert body.get("openapi"), "OpenAPI schema must advertise its version"
    # At least one of our real endpoints must appear.
    paths = body.get("paths", {})
    assert "/api/list" in paths


def test_docs_ui_is_reachable(client: TestClient) -> None:
    resp = client.get("/docs")
    assert resp.status_code == 200
    # Swagger UI ships an HTML shell; contents are incidental.
    assert "text/html" in resp.headers.get("content-type", "")
