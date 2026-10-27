import os
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.user import User, UserRole
from models.organisation import Organisation
from middleware import (
    get_password_hash,
    create_access_token,
    create_refresh_token,
)
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio

account = Acc(email=None, token=None)


class TestArchiveUserModel:
    def test_user_model_archived_fields_and_serialize(
        self, session: Session
    ) -> None:
        org = session.query(Organisation).first()
        if not org:
            org = Organisation(code="TEST", name="Test Org", active=True)
            session.add(org)
            session.commit()
            session.refresh(org)

        # Clean up any leftover test data
        session.query(User).filter(
            User.email.in_(["admin_tester@akvo.org", "target_user@akvo.org"])
        ).delete(synchronize_session=False)
        session.commit()

        # Create a test admin user and target user
        admin = User(
            name="Admin Tester",
            email="admin_tester@akvo.org",
            phone_number="12345",
            password="hashed_pw",
            role=UserRole.secretariat_admin,
            organisation=org.id,
            invitation=None,
            approved=True,
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)

        now = datetime.utcnow()
        user = User(
            name="Target User",
            email="target_user@akvo.org",
            phone_number="54321",
            password="hashed_pw",
            role=UserRole.member_user,
            organisation=org.id,
            invitation=None,
            approved=True,
            archived=True,
            last_status_changed_at=now,
            last_status_changed_by=admin.id,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        assert user.archived is True
        assert user.last_status_changed_at == now
        assert user.last_status_changed_by == admin.id
        assert user.status_changer is not None
        assert user.status_changer.id == admin.id
        assert user.status_changer.name == "Admin Tester"

        serialized = user.serialize
        assert serialized["archived"] is True
        assert serialized["last_status_changed_at"] == now
        assert serialized["last_status_changed_by"] == admin.id
        assert serialized["last_status_changed_by_name"] == "Admin Tester"

        # Cleanup
        session.delete(user)
        session.delete(admin)
        session.commit()


ARCHIVED_ERROR_MSG = (
    "Your account has been archived. Please contact your administrator."
)


class TestArchiveUserAuth:
    @pytest.fixture(autouse=True)
    def setup_archived_user(self, session: Session):
        org = session.query(Organisation).first()
        if not org:
            org = Organisation(code="TEST", name="Test Org", active=True)
            session.add(org)
            session.commit()
            session.refresh(org)

        session.query(User).filter(
            User.email == "archived_user@akvo.org"
        ).delete(synchronize_session=False)
        session.commit()

        user = User(
            name="Archived Person",
            email="archived_user@akvo.org",
            phone_number="123456",
            password=get_password_hash("password123"),
            role=UserRole.member_user,
            organisation=org.id,
            invitation=None,
            approved=True,
            archived=True,
            last_status_changed_at=datetime.utcnow(),
        )
        user.email_verified = datetime.utcnow()
        session.add(user)
        session.commit()
        session.refresh(user)

        yield user

        session.query(User).filter(
            User.email == "archived_user@akvo.org"
        ).delete(synchronize_session=False)
        session.commit()

    async def test_archived_user_cannot_login(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for("user:login"),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={
                "username": "archived_user@akvo.org",
                "password": "password123",
                "grant_type": "password",
                "scopes": ["openid", "email"],
                "client_id": os.environ["CLIENT_ID"],
                "client_secret": os.environ["CLIENT_SECRET"],
            },
        )
        assert res.status_code == 403
        data = res.json()
        assert data["detail"] == ARCHIVED_ERROR_MSG

    async def test_archived_user_token_rejected_in_middleware(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        token = create_access_token(data={"email": "archived_user@akvo.org"})
        res = await client.get(
            app.url_path_for("user:me"),
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res.status_code == 403
        data = res.json()
        assert data["detail"] == ARCHIVED_ERROR_MSG

    async def test_archived_user_cannot_refresh_token(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        ref_token = create_refresh_token(
            data={"email": "archived_user@akvo.org"}
        )
        res = await client.post(
            app.url_path_for("user:refresh_token"),
            headers={"Authorization": f"Bearer {ref_token.get('token')}"},
        )
        assert res.status_code == 403
        data = res.json()
        assert data["detail"] == ARCHIVED_ERROR_MSG

    async def test_archived_user_cannot_request_password_reset(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for("user:forgot-password"),
            data={"email": "archived_user@akvo.org"},
        )
        assert res.status_code == 403
        data = res.json()
        assert data["detail"] == ARCHIVED_ERROR_MSG
