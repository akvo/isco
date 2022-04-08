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
    async def test_save_data(self, app: FastAPI, session: Session,
                             client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=0),
            params={"locked_by": 1},
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
                "comment": None,
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
            "locked_by": 1,
            "created": today,
            "created_by": "John Doe",
            "organisation": "Akvo",
            "submitted_by": None,
            "updated": None,
            "submitted": None,
            "answer": [
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 0,
                    "value": "Option 1"
                },
                {
                    "comment": "This is comment",
                    "question": 2,
                    "repeat_index": 0,
                    "value": "Depend to Q1 Option 1"
                },
                {
                    "comment": None,
                    "question": 3,
                    "repeat_index": 0,
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
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "locked_by": None,
            "created": today,
            "created_by": "John Doe",
            "organisation": "Akvo",
            "submitted_by": None,
            "updated": today,
            "submitted": None,
            "answer": [
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 0,
                    "value": "Option 1"
                },
                {
                    "comment": "This is comment",
                    "question": 2,
                    "repeat_index": 0,
                    "value": "Depend to Q1 Option 1"
                },
                {
                    "comment": "Add comment on update",
                    "question": 3,
                    "repeat_index": 0,
                    "value": "Female"
                },
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 1,
                    "value": "Option 1"
                },
                {
                    "comment": None,
                    "question": 2,
                    "repeat_index": 1,
                    "value": "Test repeat"
                },
                {
                    "comment": None,
                    "question": 3,
                    "repeat_index": 1,
                    "value": "Male"
                },
                {
                    "comment": "Q4 comment",
                    "question": 4,
                    "repeat_index": 0,
                    "value": 20
                }
            ]
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
            "name": "Depend to Q1 Option 1",
            "geo": None,
            "locked_by": None,
            "created": today,
            "created_by": "John Doe",
            "organisation": "Akvo",
            "submitted_by": None,
            "updated": today,
            "submitted": None,
            "answer": [
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 0,
                    "value": "Option 1"
                },
                {
                    "comment": "This is comment",
                    "question": 2,
                    "repeat_index": 0,
                    "value": "Depend to Q1 Option 1"
                },
                {
                    "comment": "Add comment on update",
                    "question": 3,
                    "repeat_index": 0,
                    "value": "Female"
                },
                {
                    "comment": "Q4 comment",
                    "question": 4,
                    "repeat_index": 0,
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
                "comment": "Q5 comment",
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
            "locked_by": 1,
            "created": today,
            "created_by": "John Doe",
            "organisation": "Akvo",
            "submitted_by": "John Doe",
            "updated": today,
            "submitted": today,
            "answer": [
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 0,
                    "value": "Option 1"
                },
                {
                    "comment": "This is comment",
                    "question": 2,
                    "repeat_index": 0,
                    "value": "Depend to Q1 Option 1"
                },
                {
                    "comment": "Q3 comment",
                    "question": 3,
                    "repeat_index": 0,
                    "value": "Male"
                },
                {
                    "comment": "Q4 comment",
                    "question": 4,
                    "repeat_index": 0,
                    "value": 25
                },
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 1,
                    "value": "Option 1"
                },
                {
                    "comment": None,
                    "question": 2,
                    "repeat_index": 1,
                    "value": "Test repeat"
                },
                {
                    "comment": "Q3 comment 1",
                    "question": 3,
                    "repeat_index": 1,
                    "value": "Female"
                },
                {
                    "comment": "Q5 comment",
                    "question": 5,
                    "repeat_index": 0,
                    "value": 75
                }
            ]
        }

    @pytest.mark.asyncio
    async def test_submit_data(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
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
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 2,
            "form": 1,
            "name": "Direct submit",
            "geo": None,
            "locked_by": 1,
            "created": today,
            "created_by": "John Doe",
            "organisation": "Akvo",
            "submitted_by": "John Doe",
            "updated": today,
            "submitted": today,
            "answer": [
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 0,
                    "value": "Option 1"
                },
                {
                    "comment": None,
                    "question": 2,
                    "repeat_index": 0,
                    "value": "Direct submit"
                },
                {
                    "comment": None,
                    "question": 3,
                    "repeat_index": 0,
                    "value": "Female"
                },
                {
                    "comment": None,
                    "question": 4,
                    "repeat_index": 0,
                    "value": 35
                },
                {
                    "comment": "Q5 comment",
                    "question": 5,
                    "repeat_index": 0,
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
            "locked_by": 1,
            "created": today,
            "created_by": "John Doe",
            "organisation": "Akvo",
            "submitted_by": "John Doe",
            "updated": today,
            "submitted": today,
            "answer": [
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 0,
                    "value": "Option 1"
                },
                {
                    "comment": None,
                    "question": 2,
                    "repeat_index": 0,
                    "value": "Direct submit"
                },
                {
                    "comment": None,
                    "question": 3,
                    "repeat_index": 0,
                    "value": "Female"
                },
                {
                    "comment": None,
                    "question": 4,
                    "repeat_index": 0,
                    "value": 35
                },
                {
                    "comment": "Q5 comment",
                    "question": 5,
                    "repeat_index": 0,
                    "value": 55
                }
            ]
        }
