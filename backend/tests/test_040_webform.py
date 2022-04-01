import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestFormToJson():
    @pytest.mark.asyncio
    async def test_get_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        # get form
        res = await client.get(
            app.url_path_for("form:get_webform_by_id", form_id=1))
        assert res.status_code == 200
        res = res.json()
        assert len(res['question_group']) > 0

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
            app.url_path_for("form:publish_survey"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": 1})
        assert res.status_code == 200
        res = res.json()
        assert res["version"] == form["version"] + 1
        assert res["updated"] is not None
