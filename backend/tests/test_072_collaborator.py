import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
collaborator_account = Acc(email=None, token=None)
account = Acc(email="galih@test.org", token=None)
org_name = "Organisation DISCO - Traders Member and DISCO isco"
today = datetime.today().strftime("%B %d, %Y")


class TestCollaboratorRoutes():
    @pytest.mark.asyncio
    async def test_add_collaborator(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get organisation
        res = await client.get(
            app.url_path_for("organisation:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # create
        res = await client.post(
            app.url_path_for("collaborator:create", data=2),
            json=[{"organisation": 1}],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{'data': 2, 'id': 1, 'organisation': 1}]

    @pytest.mark.asyncio
    async def test_get_collaborator(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("collaborator:get_by_data_id", data=2),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{'data': 2, 'id': 1, 'organisation': 1}]

    @pytest.mark.asyncio
    async def test_update_collaborator(
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
        # update
        res = await client.put(
            app.url_path_for("collaborator:put", data=2),
            json=[{"organisation": 1}, {"organisation": 2}],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [
            {'data': 2, 'id': 1, 'organisation': 1},
            {'data': 2, 'id': 2, 'organisation': 2}]

    @pytest.mark.asyncio
    async def test_delete_one_collaborator(
        self, app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.put(
            app.url_path_for("collaborator:put", data=2),
            json=[{"organisation": 1}],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{'data': 2, 'id': 1, 'organisation': 1}]

    @pytest.mark.asyncio
    async def test_get_saved_collaborator_submission(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("data:get_saved_data_by_organisation"),
            headers={"Authorization": f"Bearer {collaborator_account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            'created': today,
            'created_by': 'Galih',
            'form': 1,
            'id': 2,
            'locked_by': 2,
            'name': f'Form Test - {org_name} - Galih - {today}',
            'organisation': org_name
        }]
