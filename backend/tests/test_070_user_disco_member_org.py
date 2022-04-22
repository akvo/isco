import os
import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.user import User, UserRole
from tests.test_000_main import Acc

sys.path.append("..")

account = Acc(email="support@akvo.org", token=None)


class TestUserDisco():
    @pytest.mark.asyncio
    async def test_user_register(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # create organisation
        user_payload = {
            "name": "Galih",
            "email": "galih@test.org",
            "phone_number": "081999101010",
            "password": "test",
            "role": UserRole.secretariat_admin.value,
            "organisation": 3,
            "questionnaires": [1],
        }
        res = await client.post(
            app.url_path_for("user:register"), data=user_payload)
        assert res.status_code == 200
        invitation_link = session.query(User).filter(
            User.email == user_payload["email"]).first().invitation
        res = res.json()
        assert res == {
            "email": "galih@test.org",
            "email_verified": None,
            "id": 2,
            "invitation": invitation_link,
            "name": "Galih",
            "organisation": 3,
            "role": "secretariat_admin",
            "questionnaires": [1],
            "phone_number": "081999101010",
        }

    @pytest.mark.asyncio
    async def test_verify_user_email(self, app: FastAPI, session: Session,
                                     client: AsyncClient) -> None:
        res = await client.put(
            app.url_path_for("user:verify_email"),
            params={"email": "galih@test.org"})
        assert res.status_code == 200
        res = res.json()
        assert res['email_verified'] is not None

    @pytest.mark.asyncio
    async def test_user_login(self, app: FastAPI, session: Session,
                              client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("user:login"),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={
                "username": "galih@test.org",
                "password": "test",
                "grant_type": "password",
                "scopes": ["openid", "email"],
                "client_id": os.environ["CLIENT_ID"],
                "client_secret": os.environ["CLIENT_SECRET"]
            })
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

    @pytest.mark.asyncio
    async def test_update_user_by_admin(self, app: FastAPI, session: Session,
                                        client: AsyncClient) -> None:
        user_id = 2
        user_payload = {
            "role": UserRole.secretariat_admin.value,
            "organisation": 3,
            "questionnaires": [1, 2],
        }
        res = await client.put(
            app.url_path_for("user:update_by_admin", id=user_id),
            headers={"Authorization": f"Bearer {account.token}"},
            json=user_payload)
        assert res.status_code == 200
        res = res.json()
        assert res["email"] == "galih@test.org"
        assert res["organisation"] == 3
        assert res["role"] == "secretariat_admin"
        assert res["questionnaires"] == [1, 2]

    @pytest.mark.asyncio
    async def test_user_update_password(self, app: FastAPI, session: Session,
                                        client: AsyncClient) -> None:
        account = Acc(email="galih@test.org", token=None)
        res = await client.put(
            app.url_path_for("user:update_password"),
            headers={"Authorization": f"Bearer {account.token}",
                     "content-type": "application/x-www-form-urlencoded"},
            data={
                "old_password": "test",
                "new_password": "test123",
            })
        assert res.status_code == 200
        res = res.json()
        assert res["email"] == "galih@test.org"
        # test login with new password
        res = await client.post(
            app.url_path_for("user:login"),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={
                "username": "galih@test.org",
                "password": "test123",
                "grant_type": "password",
                "scopes": ["openid", "email"],
                "client_id": os.environ["CLIENT_ID"],
                "client_secret": os.environ["CLIENT_SECRET"]
            })
        assert res.status_code == 200
        res = res.json()
        assert res['access_token'] is not None
        assert res['token_type'] == 'bearer'
        account = Acc(email="galih@test.org", token=res['access_token'])
        assert account.token == res['access_token']
