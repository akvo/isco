import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc
import util.storage as storage

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestWebformRoutes():
    @pytest.mark.asyncio
    async def test_transform_form(self, app: FastAPI, session: Session,
                                  client: AsyncClient) -> None:
        # get form
        res = await client.get(
            app.url_path_for("form:transform", form_id=1))
        assert res.status_code == 200
        res = res.json()
        assert len(res['question_group']) > 0
        assert "en" in res["languages"]

    @pytest.mark.asyncio
    async def test_publish_form(self, app: FastAPI, session: Session,
                                client: AsyncClient) -> None:
        # get form
        form = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert form.status_code == 200
        form = form.json()
        assert form["id"] == 1
        # publish form
        res = await client.post(
            app.url_path_for("form:publish"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": 1})
        assert res.status_code == 200
        res = res.json()
        assert res["version"] == form["version"] + 1
        assert res["url"] is not None
        assert res["published"] is not None
        assert storage.check(res["url"]) is True

    @pytest.mark.asyncio
    async def test_get_form_options(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        # get form
        res = await client.get(
            app.url_path_for("form:get_webform_options"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "disabled": False,
            "label": "Form Test",
            "value": 1
        }]

    @pytest.mark.asyncio
    async def test_get_webform_from_bucket(self, app: FastAPI,
                                           session: Session,
                                           client: AsyncClient) -> None:
        # get form
        res = await client.get(
            app.url_path_for(
                "form:get_webform_from_bucket",
                form_id=1
            ),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert "form" in res
        assert len(res["form"]["question_group"]) > 0
