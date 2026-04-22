#!/usr/bin/env -S uv run --script

# Source: https://whgazetteer.org/api/datasets
# Docs: https://docs.whgazetteer.org/content/400-Technical.html

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
#     "pydantic",
# ]
# ///

"""
Bulk-import dataset metadata from the World Historical Gazetteer (WHG) API.

The WHG public API returns a list of datasets (``Feature`` objects) at:
    GET https://whgazetteer.org/api/datasets
"""

import json
import logging
from collections.abc import Iterator
from pathlib import Path

import httpx
from pydantic import ValidationError

from server.plugins.ome_plugin import EducationResource
from server.plugins.whg.plugin import WHGPlugin
from server.plugins.whg.whg_models import Feature, Model

WHG_DATASETS_URL = "https://whgazetteer.org/api/datasets"

logger = logging.getLogger(__name__)

plugin = WHGPlugin()


def _parse_features(items: list) -> list[Feature]:
    """
    Validate raw API items into Feature records.

    Uses a Python 3.13+ ExceptionGroup to gather and report all validation
    errors at once rather than stopping at the first malformed record.
    Valid records are returned even when some items fail validation.
    """
    features: list[Feature] = []
    errors: list[ValidationError] = []
    for item in items:
        try:
            features.append(Feature.model_validate(item))
        except ValidationError as exc:
            errors.append(exc)
    if errors:
        msg = f"Skipping {len(errors)} malformed WHG dataset record(s)"
        try:
            raise ExceptionGroup(msg, errors)
        except* ValidationError as eg:
            for exc in eg.exceptions:
                logger.warning("Malformed WHG dataset record: %s", exc)
    return features


def fetch_datasets(url: str = WHG_DATASETS_URL) -> list[Feature]:
    """
    Fetch all datasets from the WHG API.

    Args:
        url: WHG datasets API endpoint.

    Returns:
        A list of :class:`Feature` records.
    """
    try:
        with httpx.Client(follow_redirects=True, timeout=30.0) as httpx_client:
            response = httpx_client.get(url).raise_for_status()
    except httpx.HTTPError as exc:
        status_code = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError)
            else "N/A"
        )
        msg = (
            f"Failed to fetch WHG datasets from API: {url} "
            f"(Status: {status_code}). {exc!s}"
        )
        raise RuntimeError(msg) from exc

    payload = response.json()
    items = payload.get("features", payload) if isinstance(payload, dict) else payload
    return _parse_features(items)


def bulk_translate(features: list[dict]) -> Iterator[EducationResource]:
    """Translate a list of raw WHG feature dicts to OME EducationResource cards."""
    yield from (plugin.make_metadata_card_from_json(json.dumps(f)) for f in features)


def bulk_import(
    url: str = WHG_DATASETS_URL,
    cache_path: Path | None = None,
) -> list[dict]:
    """
    Fetch WHG datasets and return serialised OME records.

    Results are cached locally so that repeated runs do not re-fetch the API.

    Args:
        url: WHG datasets API endpoint.
        cache_path: Path to the local JSON cache file.  If ``None``, defaults
                    to ``whg.json`` next to this module.

    Returns:
        A list of serialised :class:`EducationResource` dicts.
    """
    if cache_path is None:
        cache_path = Path(__file__).resolve().parent / "whg.json"

    if not cache_path.exists():
        features = fetch_datasets(url)
        model = Model(
            count=len(features),
            parameters={},
            features=features,
        )
        cache_path.write_text(model.model_dump_json(indent=2) + "\n")

    payload = json.loads(cache_path.read_text())
    features = (
        payload.get("features", payload) if isinstance(payload, dict) else payload
    )
    return [card.model_dump() for card in bulk_translate(features)]


if __name__ == "__main__":
    here = Path(__file__).resolve().parent

    print("=== World Historical Gazetteer datasets ===")
    results = bulk_import(cache_path=here / "whg.json")
    print(f"Found {len(results)} datasets")
    for card in results:
        print(f"  {card['title']!r}  (authors: {card['authors']})")
