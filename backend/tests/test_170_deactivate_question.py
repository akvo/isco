import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestQuestionRoutes():
    @pytest.mark.asyncio
    async def test_update_question_wtih_deactivate(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get question
        res = await client.get(
            app.url_path_for("question:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update question
        question_payload = [{
            "id": 1,
            "deactivate": True,
        }]
        res = await client.put(
            app.url_path_for("data:bulk-deactivate"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 204
