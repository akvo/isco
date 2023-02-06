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


class TestSubmissionRoutes():
    @pytest.mark.asyncio
    async def test_save_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        payload = [{
            "question": 1,
            "repeat_index": 0,
            "comment": None,
            "value": "Option 1"
        }, {
            "question": 2,
            "repeat_index": 0,
            "comment": "This is comment",
            "value": "Depend to Q1 Option 1"
        }, {
            "question": 3,
            "repeat_index": 0,
            "comment": None,
            "value": "Male"
        }]
        # direct submit without core mandatory answered
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=1),
            params={"locked_by": 1},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 400
        # save data
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=0),
            params={"locked_by": 1},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "form": 1,
            "form_name": "Form Test",
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "locked_by": 1,
            "created": today,
            "created_by": "John Doe",
            "organisation": "staff Akvo",
            "submitted_by": None,
            "updated": None,
            "submitted": None,
            "answer": [{
                "comment": None,
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1"
            }, {
                "comment": "This is comment",
                "question": 2,
                "repeat_index": 0,
                "value": "Depend to Q1 Option 1"
            }, {
                "comment": None,
                "question": 3,
                "repeat_index": 0,
                "value": "Male"
            }]
        }

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
            params={"data_id": 1},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert "form" in res
        assert "initial_values" in res
        assert res["initial_values"] == {
            'created': today,
            'created_by': 'John Doe',
            'form': 1,
            "form_name": "Form Test",
            'geo': None,
            'id': 1,
            'locked_by': 1,
            'name': 'Depend to Q1 Option 1',
            'organisation': 'staff Akvo',
            'submitted': None,
            'submitted_by': None,
            'updated': None,
            'answer': [{
                'comment': None,
                'question': 1,
                'repeat_index': 0,
                'value': 'Option 1'
            }, {
                'comment': 'This is comment',
                'question': 2,
                'repeat_index': 0,
                'value': 'Depend to Q1 Option 1'
            }, {
                'comment': None,
                'question': 3,
                'repeat_index': 0,
                'value': 'Male'
            }],
        }

    @pytest.mark.asyncio
    async def test_update_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get data by id
        res = await client.get(
            app.url_path_for("data:get_by_id", id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update and submit data without core mandatory answered
        res = await client.put(
            app.url_path_for("data:update", id=1, submitted=1),
            json=[{
                "question": 1,
                "repeat_index": 0,
                "comment": None,
                "value": "Option 1"
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 400
        # update data
        res = await client.put(
            app.url_path_for("data:update", id=1, submitted=0),
            json=[{
                "question": 1,
                "repeat_index": 0,
                "comment": None,
                "value": "Option 1"
            }, {
                "question": 2,
                "repeat_index": 0,
                "comment": "This is comment",
                "value": "Depend to Q1 Option 1"
            }, {
                "question": 3,
                "repeat_index": 0,
                "comment": "Add comment on update",
                "value": "Female"
            }, {
                "question": 1,
                "repeat_index": 1,
                "comment": None,
                "value": "Option 1"
            }, {
                "question": 2,
                "repeat_index": 1,
                "comment": None,
                "value": "Test repeat"
            }, {
                "question": 3,
                "repeat_index": 1,
                "comment": None,
                "value": "Male"
            }, {
                "question": 4,
                "comment": "Q4 comment",
                "repeat_index": 0,
                "value": 20
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "form": 1,
            "form_name": "Form Test",
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "locked_by": None,
            "created": today,
            "created_by": "John Doe",
            "organisation": "staff Akvo",
            "submitted_by": None,
            "updated": today,
            "submitted": None,
            "answer": [{
                "comment": None,
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1"
            }, {
                "comment": "This is comment",
                "question": 2,
                "repeat_index": 0,
                "value": "Depend to Q1 Option 1"
            }, {
                "comment": "Add comment on update",
                "question": 3,
                "repeat_index": 0,
                "value": "Female"
            }, {
                "comment": None,
                "question": 1,
                "repeat_index": 1,
                "value": "Option 1"
            }, {
                "comment": None,
                "question": 2,
                "repeat_index": 1,
                "value": "Test repeat"
            }, {
                "comment": None,
                "question": 3,
                "repeat_index": 1,
                "value": "Male"
            }, {
                "comment": "Q4 comment",
                "question": 4,
                "repeat_index": 0,
                "value": 20.0
            }]
        }

    @pytest.mark.asyncio
    async def test_update_data_with_deleted_repeat(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get data by id
        res = await client.get(
            app.url_path_for("data:get_by_id", id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update data
        res = await client.put(
            app.url_path_for("data:update", id=1, submitted=0),
            json=[{
                "comment": None,
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1"
            }, {
                "comment": "This is comment",
                "question": 2,
                "repeat_index": 0,
                "value": "Depend to Q1 Option 1"
            }, {
                "comment": "Add comment on update",
                "question": 3,
                "repeat_index": 0,
                "value": "Female"
            }, {
                "question": 4,
                "comment": "Q4 comment",
                "repeat_index": 0,
                "value": 20
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "form": 1,
            "form_name": "Form Test",
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "locked_by": None,
            "created": today,
            "created_by": "John Doe",
            "organisation": "staff Akvo",
            "submitted_by": None,
            "updated": today,
            "submitted": None,
            "answer": [{
                "comment": None,
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1"
            }, {
                "comment": "This is comment",
                "question": 2,
                "repeat_index": 0,
                "value": "Depend to Q1 Option 1"
            }, {
                "comment": "Add comment on update",
                "question": 3,
                "repeat_index": 0,
                "value": "Female"
            }, {
                "comment": "Q4 comment",
                "question": 4,
                "repeat_index": 0,
                "value": 20
            }]
        }

    @pytest.mark.asyncio
    async def test_update_then_submit_data(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
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
                "comment": None,
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1"
            }, {
                "comment": "This is comment",
                "question": 2,
                "repeat_index": 0,
                "value": "Depend to Q1 Option 1"
            }, {
                "question": 3,
                "repeat_index": 0,
                "comment": "Q3 comment",
                "value": "Male"
            }, {
                "question": 1,
                "repeat_index": 1,
                "comment": None,
                "value": "Option 1"
            }, {
                "question": 2,
                "repeat_index": 1,
                "comment": None,
                "value": "Test repeat"
            }, {
                "question": 3,
                "repeat_index": 1,
                "comment": "Q3 comment 1",
                "value": "Female"
            }, {
                "question": 4,
                "repeat_index": 0,
                "comment": "Q4 comment",
                "value": 25
            }, {
                "question": 5,
                "repeat_index": 0,
                "comment": "Test with zero value",
                "value": 0
            }, {
                "question": 6,
                "repeat_index": 0,
                "comment": None,
                "value": [2, 12]
            }, {
                "question": 7,
                "repeat_index": 0,
                "comment": None,
                "value": ["Technology|Programming", "Sports|Football"]
            }, {
                "question": 8,
                "repeat_index": 0,
                "comment": None,
                "value": "2022-01-01"
            }, {
                "question": 9,
                "repeat_index": 0,
                "comment": None,
                "value": ["MO-1", "MO-2"]
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "form": 1,
            "form_name": "Form Test",
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "locked_by": 1,
            "created": today,
            "created_by": "John Doe",
            "organisation": "staff Akvo",
            "submitted_by": "John Doe",
            "updated": today,
            "submitted": today,
            "answer": [{
                "comment": None,
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1"
            }, {
                "comment": "This is comment",
                "question": 2,
                "repeat_index": 0,
                "value": "Depend to Q1 Option 1"
            }, {
                "comment": "Q3 comment",
                "question": 3,
                "repeat_index": 0,
                "value": "Male"
            }, {
                "comment": "Q4 comment",
                "question": 4,
                "repeat_index": 0,
                "value": 25.0
            }, {
                "comment": None,
                "question": 1,
                "repeat_index": 1,
                "value": "Option 1"
            }, {
                "comment": None,
                "question": 2,
                "repeat_index": 1,
                "value": "Test repeat"
            }, {
                "comment": "Q3 comment 1",
                "question": 3,
                "repeat_index": 1,
                "value": "Female"
            }, {
                "comment": "Test with zero value",
                "question": 5,
                "repeat_index": 0,
                "value": 0.0
            }, {
                'comment': None,
                'question': 6,
                'repeat_index': 0,
                'value': [2.0, 12.0]
            }, {
                'comment': None,
                'question': 7,
                'repeat_index': 0,
                'value': ['Technology|Programming', 'Sports|Football']
            }, {
                'comment': None,
                'question': 8,
                'repeat_index': 0,
                'value': '2022-01-01'
            }, {
                'comment': None,
                'question': 9,
                'repeat_index': 0,
                'value': ['MO-1', 'MO-2']
            }]
        }

    @pytest.mark.asyncio
    async def test_submit_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=1),
            params={"locked_by": 1},
            json=[{
                "question": 1,
                "repeat_index": 0,
                "comment": None,
                "value": "Option 1"
            }, {
                "question": 2,
                "repeat_index": 0,
                "comment": None,
                "value": "Direct submit"
            }, {
                "question": 3,
                "repeat_index": 0,
                "comment": None,
                "value": "Female"
            }, {
                "question": 4,
                "repeat_index": 0,
                "comment": None,
                "value": 35
            }, {
                "question": 5,
                "repeat_index": 0,
                "comment": "Q5 comment",
                "value": 55
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 208
