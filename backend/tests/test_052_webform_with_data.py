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


class TestWebformWithDataRoutes():
    @pytest.mark.asyncio
    async def test_get_webform_from_bucket_with_submitted_values(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(
            app.url_path_for(
                "form:get_webform_from_bucket",
                form_id=1
            ),
            params={"data_id": 1},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 208

    @pytest.mark.asyncio
    async def test_get_webform_from_bucket_with_initial_values(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(
            app.url_path_for(
                "form:get_webform_from_bucket",
                form_id=1
            ),
            params={"data_id": 3},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert "form" in res
        assert "initial_values" in res
        assert res["initial_values"] == {
            'created': 'April 08, 2022',
            'created_by': 'John Doe',
            'form': 1,
            'geo': None,
            'id': 3,
            'locked_by': 1,
            'name': '',
            'organisation': 'Akvo',
            'submitted': None,
            'submitted_by': None,
            'updated': None,
            'answer': [{'comment': 'Q1 comment',
                        'question': 1,
                        'repeat_index': 0,
                        'value': 'Option 1'}],
        }

    @pytest.mark.asyncio
    async def test_delete_publish_form(self, app: FastAPI, session: Session,
                                       client: AsyncClient) -> None:
        # get form
        form = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert form.status_code == 200
        form = form.json()
        assert form["id"] == 1
        # delete publish form
        res = await client.delete(
            app.url_path_for("form:delete_publish", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["version"] is None
        assert res["url"] is None
        assert res["published"] is None
        assert storage.check(form["url"]) is False
