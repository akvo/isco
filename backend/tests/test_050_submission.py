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
    async def test_get_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        res = await client.get(app.url_path_for("form:transform", form_id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        assert len(res['question_group']) > 0

    @pytest.mark.asyncio
    async def test_save_data(self, app: FastAPI, session: Session,
                             client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=0),
            json=[{
                "question": 1,
                "value": "Option 1"
            }, {
                "question": 2,
                "value": "Depend to Q1 Option 1"
            }, {
                "question": 3,
                "value": "Male"
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "form": 1,
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "created": today,
            "created_by": "John Doe",
            "submitted_by": None,
            "updated": None,
            "submitted": None,
            "answer": [
                {
                    "question": 1,
                    "value": "Option 1"
                },
                {
                    "question": 2,
                    "value": "Depend to Q1 Option 1"
                },
                {
                    "question": 3,
                    "value": "Male"
                }
            ]
        }

    @pytest.mark.asyncio
    async def test_update_data(self, app: FastAPI, session: Session,
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
            app.url_path_for("data:update", id=1, submitted=0),
            json=[{
                "question": 3,
                "value": "Female"
            }, {
                "question": 4,
                "value": 20
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "form": 1,
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "created": today,
            "created_by": "John Doe",
            "submitted_by": None,
            "updated": today,
            "submitted": None,
            "answer": [
                {
                    "question": 1,
                    "value": "Option 1"
                },
                {
                    "question": 2,
                    "value": "Depend to Q1 Option 1"
                },
                {
                    "question": 3,
                    "value": "Female"
                },
                {
                    "question": 4,
                    "value": 20
                }
            ]
        }

    @pytest.mark.asyncio
    async def test_update_then_submit_data(self, app: FastAPI,
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
            json=[{
                "question": 3,
                "value": "Male"
            }, {
                "question": 4,
                "value": 25
            }, {
                "question": 5,
                "value": 75
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "form": 1,
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "created": today,
            "created_by": "John Doe",
            "submitted_by": "John Doe",
            "updated": today,
            "submitted": today,
            "answer": [
                {
                    "question": 1,
                    "value": "Option 1"
                },
                {
                    "question": 2,
                    "value": "Depend to Q1 Option 1"
                },
                {
                    "question": 3,
                    "value": "Male"
                },
                {
                    "question": 4,
                    "value": 25
                },
                {
                    "question": 5,
                    "value": 75
                }
            ]
        }

    @pytest.mark.asyncio
    async def test_submit_data(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=1),
            json=[{
                "question": 1,
                "value": "Option 1"
            }, {
                "question": 2,
                "value": "Direct submit"
            }, {
                "question": 3,
                "value": "Female"
            }, {
                "question": 4,
                "value": 35
            }, {
                "question": 5,
                "value": 55
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 2,
            "form": 1,
            "name": "Direct submit",
            "geo": None,
            "created": today,
            "created_by": "John Doe",
            "submitted_by": "John Doe",
            "updated": today,
            "submitted": today,
            "answer": [
                {
                    "question": 1,
                    "value": "Option 1"
                },
                {
                    "question": 2,
                    "value": "Direct submit"
                },
                {
                    "question": 3,
                    "value": "Female"
                },
                {
                    "question": 4,
                    "value": 35
                },
                {
                    "question": 5,
                    "value": 55
                }
            ]
        }

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
            "id": 2,
            "form": 1,
            "name": "Direct submit",
            "geo": None,
            "created": today,
            "created_by": "John Doe",
            "submitted_by": "John Doe",
            "updated": today,
            "submitted": today,
            "answer": [
                {
                    "question": 1,
                    "value": "Option 1"
                },
                {
                    "question": 2,
                    "value": "Direct submit"
                },
                {
                    "question": 3,
                    "value": "Female"
                },
                {
                    "question": 4,
                    "value": 35
                },
                {
                    "question": 5,
                    "value": 55
                }
            ]
        }
