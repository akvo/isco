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


class TestLoadData():
    @pytest.mark.asyncio
    async def test_get_all_user(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("user:get_all"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "data" in res
        assert "total" in res
        assert "total_page" in res
        assert "email" in res["data"][0]
        assert "email_verified" in res["data"][0]
        assert "id" in res["data"][0]
        assert "name" in res["data"][0]
        assert "organisation" in res["data"][0]
        assert "role" in res["data"][0]

    @pytest.mark.asyncio
    async def test_get_all_member(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(app.url_path_for("member_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert res[0] == {"id": 1, "name": "All"}

    @pytest.mark.asyncio
    async def test_get_all_isco(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(app.url_path_for("isco_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert res[0] == {"id": 1, "name": "All"}
