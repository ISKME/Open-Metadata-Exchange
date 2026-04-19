# P0 security & reliability fixes — branch `fix/p0-security-reliability`

Resolves issues
[#1](https://github.com/jsgoecke/Open-Metadata-Exchange/issues/1),
[#2](https://github.com/jsgoecke/Open-Metadata-Exchange/issues/2),
[#3](https://github.com/jsgoecke/Open-Metadata-Exchange/issues/3),
[#4](https://github.com/jsgoecke/Open-Metadata-Exchange/issues/4).

All fixes were implemented with TDD: failing test first, minimal
implementation second, then refactor. Full offline unit test coverage
has been added for each fix.

## Summary of behavior changes

| Area | Before | After |
|---|---|---|
| CORS | `allow_origins=["*"]` hardcoded | Env-driven via `OME_ALLOWED_ORIGINS`; wildcards forbidden when `OME_ENV=prod` |
| NNTP credentials | Hardcoded `username="node"`, `password="node"` | Required env vars `INN_USERNAME` / `INN_PASSWORD`; missing → `MissingNNTPCredentialsError` |
| Connection pool on error | `__exit__` silently recycled broken connections | Broken connections are destroyed via `factory.destroy`; only clean exits are recycled |
| API pagination metadata | Hardcoded `total_num_articles=124`, `page=1` | Real count aggregated from `channel_summary().estimated_total_articles`; `page` query parameter is honored |
| Fabricated detail fields | `source`, `grade_sublevel`, `license`, `visits` shipped hardcoded fake values | Honest defaults (`""` / `[]` / `0`) until real metadata sources are plumbed through (see follow-up TODO in `server/utils.py::post_to_details`) |

## Issue-by-issue

### #1 — CORS allow-list (`server/config.py`, `server/main.py`, `server/newsgroups_view.py`)

New module `server/config.py` exposes:

- `get_allowed_origins() -> list[str]`
- `get_cors_middleware_kwargs() -> dict[str, Any]`
- `is_production() -> bool`
- `InvalidCORSConfigError`

`OME_ALLOWED_ORIGINS` is parsed as a comma-separated list with
whitespace trimming and empty-entry drop. In production
(`OME_ENV=prod`) the variable is required and must not contain `*`.
Otherwise a small localhost allow-list is used by default.

`main.py` and `newsgroups_view.py` now register the middleware with
`**get_cors_middleware_kwargs()` — no more wildcard.

Tests: `tests/test_p0_config.py` (7 cases) plus endpoint-level
verification in `tests/test_p0_main_endpoints.py`.

### #2 — NNTP credentials from environment (`server/connection_pool.py`)

The `"node" / "node"` strings are gone. `ClientFactory.createInstance`
calls `_require_env("INN_USERNAME")` / `_require_env("INN_PASSWORD")`;
missing or empty values raise `MissingNNTPCredentialsError` — we fail
fast rather than substitute a default.

`INN_PORT` is now honored too (default 119).

Tests: `tests/test_p0_connection_pool.py::test_client_factory_*` (4
cases).

### #3 — Remove hardcoded mock data (`server/utils.py`, `server/main.py`)

- `post_to_details` no longer emits fabricated `source`,
  `grade_sublevel`, `license`, or `visits` values. It returns
  conservative empty/zero defaults with a `TODO` pointing at the
  followup work (extending the plugin metadata schema to carry these
  fields).
- `browse_results` now computes `total_num_articles` via
  `_total_articles_across_channels()` which sums
  `channel_summary(slug).estimated_total_articles` across every
  plugin-registered channel.
- `get_channel_resources` uses the per-channel
  `channel_summary(slug).estimated_total_articles` directly.
- `get_channel_summary` replaces `numResources=100` and the
  fabricated `educationLevels` list with the real NNTP count and an
  empty list respectively.
- `browse_results` and `get_channel_resources` now accept and return a
  `page` parameter. The endpoint signatures in `main.py` expose
  `page` as a query parameter.

**Scope note:** physically skipping the first N·per_page articles at
the NNTP layer (i.e. fetching page 3 of `articles` rather than the
latest N regardless of page) is a follow-up; the underlying
`ome_node.get_last_n_posts` API does not take an offset. The
pagination *metadata* returned to the client is now real, which
addresses the primary correctness bug. See TODO in
`server/utils.py::browse_results`.

Tests: `tests/test_p0_utils.py` (7 cases), endpoint wiring in
`tests/test_p0_main_endpoints.py` (5 cases).

### #4 — Connection pool `__exit__` cleanup (`server/connection_pool.py`)

`ClientContextManager.__exit__` now:

- Takes properly-typed exception parameters (`type[BaseException] |
  None`, `BaseException | None`, `TracebackType | None`).
- On clean exit: returns the pooled object to the pool via
  `pond.recycle`.
- On *any* exception: destroys the pooled object via
  `factory.destroy` — we cannot prove the connection is healthy after
  a failure, so we drop it conservatively.
- Returns `False` so exceptions always propagate.

`factory.destroy` now also best-effort closes the underlying client
via `client.quit()`.

Tests: `tests/test_p0_connection_pool.py::test_context_manager_*` (5
cases).

## Test infrastructure

`tests/conftest.py` is new and does two things:

1. Detects whether port 119 on `INN_SERVER_NAME` is reachable. If not,
   it monkeypatches `nntp.NNTPClient.__init__` to a no-op so modules
   that eagerly register an NNTP connection at import time can be
   imported in offline unit tests. CI unaffected — the INN service
   container is reachable, so no stub is installed.
2. When stubbed, auto-skips the integration tests in
   `tests/test_ome_node.py` (which hit a real INN server) to keep the
   offline suite green.

Defaults for `INN_USERNAME`, `INN_PASSWORD`, and `INN_SERVER_NAME` are
set so the new env-required code paths don't explode during local
collection.

## Running the tests

Offline (no INN server needed):

```bash
uv run pytest
# expected: ~55 passed, 56 skipped
```

Full integration (requires a reachable INN server on port 119):

```bash
docker compose up -d nntp-server
INN_USERNAME=node INN_PASSWORD=node OME_ENV=dev uv run pytest
```

CI runs the integration mode via the `inn-service` container in
`.github/workflows/ci.yml`.

## Migration notes for deployers

- Set `INN_USERNAME` and `INN_PASSWORD` on every environment that
  runs the FastAPI server, or it will refuse to start. The supplied
  `docker-compose*.yml` files inject sensible defaults that match the
  preseeded INN users.
- Set `OME_ENV=prod` and `OME_ALLOWED_ORIGINS=<csv>` on production
  deployments. Anything else will raise `InvalidCORSConfigError`
  at startup — by design.
- Review `.env.example` for the full list of supported environment
  variables.
