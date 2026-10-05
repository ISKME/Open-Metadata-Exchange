import json
from pathlib import Path

import pytest

from server.plugins.whg.plugin import WHGPlugin
from server.plugins.whg.whg_models import Feature, Model

WHG_DIR = Path(__file__).parent.parent / "server" / "plugins" / "whg"


def test_feature_model_from_json() -> None:
    """Feature model correctly parses the sample whg_item.json fixture."""
    feature = Feature.model_validate_json((WHG_DIR / "whg_item.json").read_text())
    assert feature.id == 657
    assert feature.place_count == 305
    assert feature.owner == "WHG Admin"
    assert feature.label == "africanports1887"
    assert feature.title == "African Ports, 1887"
    assert feature.description == "305 settlements and ports on the West African coast"
    assert feature.datatype == "place"
    assert feature.ds_status == "indexed"
    assert feature.create_date == "2020-06-17T14:56:01.812576"
    assert feature.public is True
    assert feature.core is False
    assert feature.creator == "Dr. Patricia Seed"
    assert feature.webpage is None
    assert feature.contributors == "Atteoudeyi Azizou; Patrick Manning"


def test_model_from_json() -> None:
    """Model correctly parses the full whg.json dataset listing."""
    model = Model.model_validate_json((WHG_DIR / "whg.json").read_text())
    assert model.count > 0
    assert len(model.features) == model.count
    assert all(isinstance(f, Feature) for f in model.features)


def test_whg_plugin_attributes() -> None:
    """WHGPlugin exposes the expected mimetypes and newsgroups."""
    plugin = WHGPlugin()
    assert plugin.mimetypes == ("application/vnd.whg.whg+json",)
    assert "ome.whg" in plugin.newsgroups
    assert "whgazetteer.org" in plugin.newsgroups["ome.whg"]


def test_make_metadata_card_from_json() -> None:
    """make_metadata_card_from_json correctly converts the sample fixture."""
    plugin = WHGPlugin()
    card = plugin.make_metadata_card_from_json((WHG_DIR / "whg_item.json").read_text())
    assert card.title == "African Ports, 1887"
    assert card.description == "305 settlements and ports on the West African coast"
    assert card.authors == ["Dr. Patricia Seed", "Atteoudeyi Azizou", "Patrick Manning"]
    assert card.authoring_institution == "WHG Admin"
    assert card.subject_tags == ["place"]
    assert card.source_url == ""


def test_make_metadata_card_webpage_as_source_url() -> None:
    """When a Feature has a webpage, it becomes the source_url of the card."""
    plugin = WHGPlugin()
    payload = json.dumps(
        {
            "id": 1,
            "place_count": 10,
            "owner": "Test Owner",
            "label": "test",
            "title": "Test Dataset",
            "description": "A test dataset",
            "datatype": "place",
            "ds_status": "indexed",
            "create_date": "2021-01-01T00:00:00",
            "public": True,
            "core": False,
            "creator": "Test Creator",
            "webpage": "https://whgazetteer.org/datasets/1",
            "contributors": None,
        }
    )
    card = plugin.make_metadata_card_from_json(payload)
    assert card.source_url == "https://whgazetteer.org/datasets/1"


def test_make_metadata_card_null_contributors() -> None:
    """None contributors must not add an empty string to the authors list."""
    plugin = WHGPlugin()
    payload = json.dumps(
        {
            "id": 2,
            "place_count": 5,
            "owner": "Test Owner",
            "label": "test2",
            "title": "Test Dataset 2",
            "description": "Another test dataset",
            "datatype": "place",
            "ds_status": "indexed",
            "create_date": "2022-03-15T00:00:00",
            "public": True,
            "core": False,
            "creator": "Test Creator",
            "webpage": None,
            "contributors": None,
        }
    )
    card = plugin.make_metadata_card_from_json(payload)
    assert card.authors == ["Test Creator"]
    assert "" not in card.authors


def test_make_metadata_card_null_creator() -> None:
    """None creator must not appear in the authors list."""
    plugin = WHGPlugin()
    payload = json.dumps(
        {
            "id": 3,
            "place_count": 20,
            "owner": "Test Owner",
            "label": "test3",
            "title": "Test Dataset 3",
            "description": "Yet another test dataset",
            "datatype": "place",
            "ds_status": "indexed",
            "create_date": "2023-06-01T00:00:00",
            "public": True,
            "core": False,
            "creator": None,
            "webpage": None,
            "contributors": "Alice; Bob",
        }
    )
    card = plugin.make_metadata_card_from_json(payload)
    assert card.authors == ["Alice", "Bob"]
    assert None not in card.authors


def test_make_metadata_card_null_creator_and_contributors() -> None:
    """None creator and None contributors produce an empty authors list."""
    plugin = WHGPlugin()
    payload = json.dumps(
        {
            "id": 4,
            "place_count": 0,
            "owner": "Test Owner",
            "label": "test4",
            "title": "Test Dataset 4",
            "description": "No attribution dataset",
            "datatype": "place, region",
            "ds_status": "indexed",
            "create_date": "2024-01-01T00:00:00",
            "public": True,
            "core": False,
            "creator": None,
            "webpage": None,
            "contributors": None,
        }
    )
    card = plugin.make_metadata_card_from_json(payload)
    assert card.authors == []


def test_make_metadata_card_multiple_datatypes() -> None:
    """Comma-separated datatype values are split into multiple subject_tags."""
    plugin = WHGPlugin()
    payload = json.dumps(
        {
            "id": 5,
            "place_count": 50,
            "owner": "Test Owner",
            "label": "test5",
            "title": "Multi-type Dataset",
            "description": "A dataset with multiple datatypes",
            "datatype": "place, region",
            "ds_status": "indexed",
            "create_date": "2024-01-01T00:00:00",
            "public": True,
            "core": False,
            "creator": "Test Creator",
            "webpage": None,
            "contributors": None,
        }
    )
    card = plugin.make_metadata_card_from_json(payload)
    assert card.subject_tags == ["place", "region"]


def test_make_metadata_card_from_url_not_implemented() -> None:
    """make_metadata_card_from_url raises NotImplementedError."""
    plugin = WHGPlugin()
    with pytest.raises(NotImplementedError):
        plugin.make_metadata_card_from_url("https://whgazetteer.org/datasets/1")
