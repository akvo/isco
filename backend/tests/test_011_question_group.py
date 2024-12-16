import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestQuestionGroupRoutes:
    @pytest.mark.asyncio
    async def test_add_question_group(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert len(res["question_group"]) == 0
        # create question group
        res = await client.post(
            app.url_path_for("question_group:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "form": 1,
                "name": "Question Group 1",
                "description": "Question Group 1 Description",
                "translations": None,
                "repeat": False,
                "repeat_text": None,
                "order": 1,
                "member_access": None,
                "isco_access": None,
                "leading_question": None,
                "question": None,
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "description": "Question Group 1 Description",
            "form": 1,
            "id": 1,
            "isco_access": [],
            "member_access": [],
            "name": "Question Group 1",
            "order": 1,
            "repeat": False,
            "repeat_text": None,
            "translations": [],
            "leading_question": None,
            "question": [],
        }

    @pytest.mark.asyncio
    async def test_get_question_group_by_id(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get question group
        res = await client.get(
            app.url_path_for("question_group:get_by_id", id=1)
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "description": "Question Group 1 Description",
            "form": 1,
            "id": 1,
            "isco_access": [],
            "member_access": [],
            "name": "Question Group 1",
            "order": 1,
            "question": [],
            "repeat": False,
            "repeat_text": None,
            "translations": [],
            "leading_question": None,
        }

    @pytest.mark.asyncio
    async def test_update_question_group(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # update question group
        res = await client.put(
            app.url_path_for("question_group:put", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "form": 1,
                "name": "Question Group 1",
                "description": "Question Group 1 Description",
                "translations": [
                    {
                        "language": "id",
                        "name": "Kelompok Pertanyaan 1",
                        "description": "Deskripsi Kelompok Pertanyaan 1",
                        "repeat_text": "Tambahkan jawaban lain",
                    }
                ],
                "repeat": True,
                "repeat_text": "Add another answer",
                "order": 1,
                "member_access": [1],
                "isco_access": [1],
                "leading_question": None,
                "question": None,
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "description": "Question Group 1 Description",
            "form": 1,
            "id": 1,
            "isco_access": [1],
            "member_access": [1],
            "name": "Question Group 1",
            "repeat": True,
            "repeat_text": "Add another answer",
            "order": 1,
            "leading_question": None,
            "question": [],
            "translations": [
                {
                    "language": "id",
                    "name": "Kelompok Pertanyaan 1",
                    "description": "Deskripsi Kelompok Pertanyaan 1",
                    "repeat_text": "Tambahkan jawaban lain",
                }
            ],
        }
