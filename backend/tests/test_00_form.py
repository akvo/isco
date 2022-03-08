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
            json={"name": "Form Test", "languages": None})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1, "languages": None, "name": "Form Test"}

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
            json={"name": "Form Test", "languages": ["id"]})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1, "languages": ["id"], "name": "Form Test"}

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
                  "translations": None,
                  "repeat": False})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1,
                       "form": 1,
                       "name": "Question Group 1",
                       "repeat": False,
                       "translations": None}

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
                  "translations": [
                      {"language": "id", "text": "Kelompok Pertanyaan 1"}],
                  "repeat": False})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1,
                       "form": 1,
                       "name": "Question Group 1",
                       "repeat": False,
                       "translations": [{
                           "language": "id",
                           "text": "Kelompok Pertanyaan 1"
                           }]}

    @pytest.mark.asyncio
    async def test_add_member_type(self, app: FastAPI, session: Session,
                                   client: AsyncClient) -> None:
        # create member type
        res = await client.post(
            app.url_path_for("member_type:create"),
            json={"name": "Retail"})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1, "name": "Retail"}

    @pytest.mark.asyncio
    async def test_add_isco_type(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # create isco type
        res = await client.post(
            app.url_path_for("isco_type:create"),
            json={"name": "ISCO"})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1, "name": "ISCO"}
