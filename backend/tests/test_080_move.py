import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


def datenow():
    now = datetime.utcnow()
    return now.strftime("%d-%m-%Y")


class TestMoveGroupAndQuestionGroup:
    @pytest.mark.asyncio
    async def test_move_question_group(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.put(
            app.url_path_for(
                "question_group:move", id=1, selected_order=1, target_order=3
            ),
            params={"target_id": 2},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204

    @pytest.mark.asyncio
    async def test_move_question_group_back(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.put(
            app.url_path_for(
                "question_group:move", id=1, selected_order=2, target_order=1
            ),
            params={"target_id": 1},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204

    @pytest.mark.asyncio
    async def test_move_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.put(
            app.url_path_for(
                "question:move", id=1, selected_order=1, target_order=2
            ),
            params={"target_group": 1},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204

    @pytest.mark.asyncio
    async def test_move_question_back(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.put(
            app.url_path_for(
                "question:move", id=1, selected_order=2, target_order=1
            ),
            params={"target_group": 1},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204
