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


class TestSavedSubmissionRoute():
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
    async def test_save_data(self, app: FastAPI, session: Session,
                             client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=0),
            params={"locked_by": 1},
            json=[{
                "question": 1,
                "repeat_index": 0,
                "comment": "Q1 comment",
                "value": "Option 1"
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 3,
            "form": 1,
            "name": "",
            "geo": None,
            "locked_by": 1,
            "created": today,
            "created_by": "John Doe",
            "organisation": "Akvo",
            "submitted_by": None,
            "updated": None,
            "submitted": None,
            "answer": [
                {
                    "comment": "Q1 comment",
                    "question": 1,
                    "repeat_index": 0,
                    "value": "Option 1"
                },
            ]
        }

    @pytest.mark.asyncio
    async def test_get_saved_submission(self, app: FastAPI, session: Session,
                                        client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("data:get_saved_data_by_organisation"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert len(res) > 0
        assert res[0] == {
            "created": today,
            "created_by": "John Doe",
            "form": 1,
            "id": 3,
            "locked_by": 1,
            "name": f"Akvo - John Doe - {today}",
            "organisation": "Akvo",
        }
