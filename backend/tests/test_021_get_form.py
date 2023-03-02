import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc
from datetime import datetime

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
today = datetime.today().strftime("%d-%m-%Y")


class TestGetAllFormList():
    @pytest.mark.asyncio
    async def test_get_all_form_list(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("form:get_all"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res[0] == {
            "id": 1,
            "name": "Form Test",
            "description": "Form Description",
            "languages": ["id"],
            "version": 0.0,
            "url": None,
            "created": today,
            "published": None,
            "has_question_group": True,
            "disableDelete": False
        }
