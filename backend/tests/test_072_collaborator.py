import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)


class TestCollaboratorRoutes():
    @pytest.mark.asyncio
    async def test_add_collaborator(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get organisation
        res = await client.get(
            app.url_path_for("organisation:get_by_id", id=2))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 2
        # create
        res = await client.post(
            app.url_path_for("collaborator:create", data=1),
            json=[{"organisation": 2}],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{'data': 1, 'id': 1, 'organisation': 2}]

    @pytest.mark.asyncio
    async def test_get_collaborator(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("collaborator:get_by_data_id", data=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{'data': 1, 'id': 1, 'organisation': 2}]

    @pytest.mark.asyncio
    async def test_update_collaborator(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get organisation
        res = await client.get(
            app.url_path_for("organisation:get_by_id", id=3))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 3
        # update
        res = await client.put(
            app.url_path_for("collaborator:put", data=1),
            json=[{"organisation": 2}, {"organisation": 3}],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [
            {'data': 1, 'id': 1, 'organisation': 2},
            {'data': 1, 'id': 2, 'organisation': 3}]

    @pytest.mark.asyncio
    async def test_delete_one_collaborator(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.put(
            app.url_path_for("collaborator:put", data=1),
            json=[{"organisation": 2}],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{'data': 1, 'id': 1, 'organisation': 2}]
