import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
today = datetime.today().strftime("%B %d, %Y")


class TestAdvancedSubmissionRoute():
    @pytest.mark.asyncio
    async def test_get_all_data(self, app: FastAPI, session: Session,
                                client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] is not None
        assert res["total_page"] is not None
        assert len(res["data"]) > 0
        assert res["data"][0] == {
            'created': today,
            'created_by': 'John Doe',
            'form': 1,
            'geo': None,
            'id': 1,
            'locked_by': 1,
            'name': 'Depend to Q1 Option 1',
            'organisation': 'Akvo',
            'submitted': today,
            'submitted_by': 'John Doe',
            'updated': today,
            'answer': [{'comment': None,
                        'question': 1,
                        'repeat_index': 0,
                        'value': 'Option 1'},
                       {'comment': 'This is comment',
                        'question': 2,
                        'repeat_index': 0,
                        'value': 'Depend to Q1 Option 1'},
                       {'comment': 'Q3 comment',
                        'question': 3,
                        'repeat_index': 0,
                        'value': 'Male'},
                       {'comment': 'Q4 comment',
                        'question': 4,
                        'repeat_index': 0,
                        'value': 25},
                       {'comment': None,
                        'question': 1,
                        'repeat_index': 1,
                        'value': 'Option 1'},
                       {'comment': None,
                        'question': 2,
                        'repeat_index': 1,
                        'value': 'Test repeat'},
                       {'comment': 'Q3 comment 1',
                        'question': 3,
                        'repeat_index': 1,
                        'value': 'Female'},
                       {'comment': 'Q5 comment',
                        'question': 5,
                        'repeat_index': 0,
                        'value': 75}],
            }

    @pytest.mark.asyncio
    async def test_get_disabled_form_options(self, app: FastAPI,
                                             session: Session,
                                             client: AsyncClient) -> None:
        # get form
        res = await client.get(
            app.url_path_for("form:get_webform_options"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "disabled": True,
            "label": "Form Test (submitted)",
            "value": 1
        }]

    @pytest.mark.asyncio
    async def test_update_submitted_data(self, app: FastAPI,
                                         session: Session,
                                         client: AsyncClient) -> None:
        # get data by id
        res = await client.get(
            app.url_path_for("data:get_by_id", id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update data
        res = await client.put(
            app.url_path_for("data:update", id=1, submitted=1),
            params={"locked_by": 1},
            json=[{
                "question": 5,
                "repeat_index": 0,
                "comment": "Q5 comment",
                "value": 80
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 208

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