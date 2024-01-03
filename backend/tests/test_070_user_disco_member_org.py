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


class TestUserDisco:
    @pytest.mark.asyncio
    async def test_user_register(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
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
            app.url_path_for("user:register"), data=user_payload
        )
        assert res.status_code == 200
        invitation_link = (
            session.query(User)
            .filter(User.email == user_payload["email"])
            .first()
            .invitation
        )
        res = res.json()
        assert res == {
            "approved": False,
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
    async def test_verify_user_email(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.put(
            app.url_path_for("user:verify_email"),
            params={"email": "galih@test.org"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["email_verified"] is not None

    @pytest.mark.asyncio
    async def test_user_login(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for("user:login"),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={
                "username": "galih@test.org",
                "password": "test",
                "grant_type": "password",
                "scopes": ["openid", "email"],
                "client_id": os.environ["CLIENT_ID"],
                "client_secret": os.environ["CLIENT_SECRET"],
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res["access_token"] is not None
        assert res["token_type"] == "bearer"
        account = Acc(email="galih@test.org", token=res["access_token"])
        assert account.token == res["access_token"]

    @pytest.mark.asyncio
    async def test_get_user_me(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        account = Acc(email="galih@test.org", token=None)
        res = await client.get(
            app.url_path_for("user:me"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["email"] == "galih@test.org"
        assert "expired" in res

    @pytest.mark.asyncio
    async def test_update_user_by_admin(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        user_id = 2
        user_payload = {
            "role": UserRole.secretariat_admin.value,
            "organisation": 3,
            "questionnaires": [1, 2],
        }
        res = await client.put(
            app.url_path_for("user:update_by_admin", id=user_id),
            headers={"Authorization": f"Bearer {account.token}"},
            json=user_payload,
        )
        assert res.status_code == 200
        res = res.json()
        assert res["email"] == "galih@test.org"
        assert res["organisation"] == 3
        assert res["role"] == "secretariat_admin"
        assert res["questionnaires"] == [1, 2]
        assert res["approved"] is False
        # Test approve user
        res = await client.put(
            app.url_path_for("user:update_by_admin", id=user_id),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"approved": 1},
            json=user_payload,
        )
        assert res.status_code == 200
        res = res.json()
        assert res["approved"] is True

    @pytest.mark.asyncio
    async def test_user_update_password(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        account = Acc(email="galih@test.org", token=None)
        res = await client.put(
            app.url_path_for("user:update_password"),
            headers={
                "Authorization": f"Bearer {account.token}",
                "content-type": "application/x-www-form-urlencoded",
            },
            data={
                "old_password": "test",
                "new_password": "test123",
            },
        )
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
                "client_secret": os.environ["CLIENT_SECRET"],
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res["access_token"] is not None
        assert res["token_type"] == "bearer"
        account = Acc(email="galih@test.org", token=res["access_token"])
        assert account.token == res["access_token"]

    @pytest.mark.asyncio
    async def test_user_invitation(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # create user
        user_payload = {
            "name": "Galih Invited",
            "email": "wayan_invited@test.org",
            "phone_number": None,
            "password": "test",
            "role": UserRole.member_user.value,
            "organisation": 1,
            "questionnaires": [],
        }
        #
        res = await client.post(
            app.url_path_for("user:register"),
            params={"invitation": 1},
            data=user_payload,
        )
        assert res.status_code == 403
        #
        res = await client.post(
            app.url_path_for("user:register"),
            headers={
                "Authorization": f"Bearer {account.token}",
                "content-type": "application/x-www-form-urlencoded",
            },
            params={"invitation": 1},
            data=user_payload,
        )
        assert res.status_code == 200
        invitation_link = (
            session.query(User)
            .filter(User.email == user_payload["email"])
            .first()
            .invitation
        )
        res = res.json()
        assert res["email"] == user_payload["email"]
        assert res["invitation"] == invitation_link
        assert res["questionnaires"] == []
        assert res["approved"] is True
        user = (
            session.query(User)
            .filter(User.email == user_payload["email"])
            .first()
        )
        res = await client.get(
            app.url_path_for("user:invitation", invitation=user.invitation)
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 3,
            "invitation": user.invitation,
            "email": user_payload["email"],
            "name": "Galih Invited",
        }
        res = await client.post(
            app.url_path_for("user:invitation", invitation=user.invitation),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={"password": "test"},
        )
        res = res.json()
        assert res["access_token"] is not None
        assert res["token_type"] == "bearer"
        user = (
            session.query(User)
            .filter(User.email == user_payload["email"])
            .first()
        )
        session.flush()
        session.refresh(user)
        assert user.invitation is None
        assert res["user"]["email"] == user_payload["email"]
        assert res["user"]["approved"] is True

    @pytest.mark.asyncio
    async def test_user_invitation_with_same_email(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # create user
        user_payload = {
            "name": "Wayan Invited",
            "email": "wayan_invited@test.org",
            "phone_number": None,
            "password": "test",
            "role": UserRole.member_user.value,
            "organisation": 1,
            "questionnaires": [],
        }
        #
        res = await client.post(
            app.url_path_for("user:register"),
            params={"invitation": 1},
            data=user_payload,
        )
        assert res.status_code == 409
