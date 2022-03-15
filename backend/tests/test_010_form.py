import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")


class TestFormRoutes():
    @pytest.mark.asyncio
    async def test_add_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        # create form
        res = await client.post(
            app.url_path_for("form:create"),
            json={"name": "Form Test",
                  "description": "Form Description",
                  "languages": None})
        assert res.status_code == 200
        res = res.json()
        assert res == {"description": "Form Description",
                       "id": 1,
                       "languages": None,
                       "name": "Form Test"}

    @pytest.mark.asyncio
    async def test_update_form(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update form
        res = await client.put(
            app.url_path_for("form:put", id=1),
            json={"name": "Form Test",
                  "description": "Form Description",
                  "languages": ["id"]})
        assert res.status_code == 200
        res = res.json()
        assert res == {"description": "Form Description",
                       "id": 1,
                       "languages": ["id"],
                       "name": "Form Test"}

    @pytest.mark.asyncio
    async def test_add_question_group(self, app: FastAPI,  session: Session,
                                      client: AsyncClient) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert len(res["question_group"]) == 0
        # create question group
        res = await client.post(
            app.url_path_for("question_group:create"),
            json={"form": 1,
                  "name": "Question Group 1",
                  "description": "Question Group 1 Description",
                  "translations": None,
                  "repeat": False,
                  "order": None,
                  "member_access": [],
                  "isco_access": [],
                  "question": []})
        assert res.status_code == 200
        res = res.json()
        assert res == {"description": "Question Group 1 Description",
                       "form": 1,
                       "id": 1,
                       "isco_access": [],
                       "member_access": [],
                       "name": "Question Group 1",
                       "order": 1,
                       "repeat": False,
                       "translations": None,
                       "question": []}

    @pytest.mark.asyncio
    async def test_update_question_group(self, app: FastAPI, session: Session,
                                         client: AsyncClient) -> None:
        # get question group
        res = await client.get(
            app.url_path_for("question_group:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update question group
        res = await client.put(
            app.url_path_for("question_group:put", id=1),
            json={"form": 1,
                  "name": "Question Group 1",
                  "description": "Question Group 1 Description",
                  "translations": [
                        {
                            "language": "id",
                            "name": "Kelompok Pertanyaan 1",
                            "description": "Deskripsi Kelompok Pertanyaan 1"
                        }
                    ],
                  "repeat": False,
                  "order": 1,
                  "member_access": [],
                  "isco_access": [],
                  "question": []})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "description": "Question Group 1 Description",
            "form": 1,
            "id": 1,
            "isco_access": [],
            "member_access": [],
            "name": "Question Group 1",
            "repeat": False,
            "order": 1,
            "question": [],
            "translations": [
                {
                    "language": "id",
                    "name": "Kelompok Pertanyaan 1",
                    "description": "Deskripsi Kelompok Pertanyaan 1"
                }
            ]
        }
