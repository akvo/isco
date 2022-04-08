import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.user import UserRole
from tests.test_000_main import Acc

sys.path.append("..")

account = Acc(email="support@akvo.org", token=None)


class TestAddUserDisco():
    @pytest.mark.asyncio
    async def test_add_disco_organisation(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # create organisation
        payload = {
            "code": None,
            "name": "Organisation DISCO - Traders Member and DISCO isco",
            "active": True,
            "member_type": 4,
            "isco_type": [
                {
                    "organisation": None,
                    "isco_type": 3
                }
            ],
        }
        res = await client.post(
            app.url_path_for("organisation:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            'active': True,
            'code': None,
            'id': 2,
            'isco_type': [3],
            'member_type': 4,
            'name': 'Organisation DISCO - Traders Member and DISCO isco',
        }

    @pytest.mark.asyncio
    async def test_user_register(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # create organisation
        user_payload = {
            "name": "Galih",
            "email": "galih@test.org",
            "phone_number": None,
            "password": "test",
            "role": UserRole.secretariat_admin.value,
            "organisation": 2
        }
        res = await client.post(
            app.url_path_for("user:register"), json=user_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "email": "galih@test.org",
            "email_verified": None,
            "id": 2,
            "name": "Galih",
            "organisation": 2,
            "role": "secretariat_admin"
        }

    @pytest.mark.asyncio
    async def test_verify_user_email(self, app: FastAPI, session: Session,
                                     client: AsyncClient) -> None:
        res = await client.put(
            app.url_path_for("user:verify_email", id=2))
        assert res.status_code == 200
        res = res.json()
        assert res['email_verified'] is not None

    @pytest.mark.asyncio
    async def test_user_login(self, app: FastAPI, session: Session,
                              client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("user:login"),
            params={"email": "galih@test.org", "password": "test"})
        assert res.status_code == 200
        res = res.json()
        assert res['access_token'] is not None
        assert res['token_type'] == 'bearer'
        account = Acc(email="galih@test.org", token=res['access_token'])
        assert account.token == res['access_token']

    @pytest.mark.asyncio
    async def test_get_user_me(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        account = Acc(email="galih@test.org", token=None)
        res = await client.get(
            app.url_path_for("user:me"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res['email'] == "galih@test.org"
