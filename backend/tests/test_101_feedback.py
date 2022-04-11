import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from .test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestFeedbackRoutes():
    @pytest.mark.asyncio
    async def test_add_feedback(self, app: FastAPI, session: Session,
                                client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("feedback:create"),
            json={
                "title": "Feedback title",
                "category": "questionnaire",
                "content": "This is feedback for questionnaire"
            },
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "user": 1,
            "title": "Feedback title",
            "category": "questionnaire",
            "content": "This is feedback for questionnaire"
        }

    @pytest.mark.asyncio
    async def test_get_all_feedback(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("feedback:get_all"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "id": 1,
            "user": 1,
            "title": "Feedback title",
            "category": "questionnaire",
            "content": "This is feedback for questionnaire"
        }]
