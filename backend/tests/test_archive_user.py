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


class TestArchiveUserRoutes:
    @pytest.fixture(autouse=True)
    def setup_route_users(self, session: Session):
        org1 = session.query(Organisation).filter(
            Organisation.code == "ORG1"
        ).first()
        if not org1:
            org1 = Organisation(
                code="ORG1", name="Organisation 1", active=True
            )
            session.add(org1)
            session.commit()
            session.refresh(org1)

        org2 = session.query(Organisation).filter(
            Organisation.code == "ORG2"
        ).first()
        if not org2:
            org2 = Organisation(
                code="ORG2", name="Organisation 2", active=True
            )
            session.add(org2)
            session.commit()
            session.refresh(org2)

        emails = [
            "super_adm@akvo.org",
            "mem_adm1@akvo.org",
            "mem_adm2@akvo.org",
            "mem_usr1@akvo.org",
            "mem_usr2@akvo.org",
        ]
        session.query(User).filter(User.email.in_(emails)).delete(
            synchronize_session=False
        )
        session.commit()

        super_admin = User(
            name="Super Admin",
            email="super_adm@akvo.org",
            phone_number="111",
            password=get_password_hash("pass"),
            role=UserRole.secretariat_admin,
            organisation=org1.id,
            invitation=None,
            approved=True,
        )
        super_admin.email_verified = datetime.utcnow()
        session.add(super_admin)

        mem_admin1 = User(
            name="Member Admin 1",
            email="mem_adm1@akvo.org",
            phone_number="222",
            password=get_password_hash("pass"),
            role=UserRole.member_admin,
            organisation=org1.id,
            invitation=None,
            approved=True,
        )
        mem_admin1.email_verified = datetime.utcnow()
        session.add(mem_admin1)

        mem_admin2 = User(
            name="Member Admin 2",
            email="mem_adm2@akvo.org",
            phone_number="333",
            password=get_password_hash("pass"),
            role=UserRole.member_admin,
            organisation=org2.id,
            invitation=None,
            approved=True,
        )
        mem_admin2.email_verified = datetime.utcnow()
        session.add(mem_admin2)

        mem_user1 = User(
            name="Member User 1",
            email="mem_usr1@akvo.org",
            phone_number="444",
            password=get_password_hash("pass"),
            role=UserRole.member_user,
            organisation=org1.id,
            invitation=None,
            approved=True,
        )
        mem_user1.email_verified = datetime.utcnow()
        session.add(mem_user1)

        mem_user2 = User(
            name="Member User 2",
            email="mem_usr2@akvo.org",
            phone_number="555",
            password=get_password_hash("pass"),
            role=UserRole.member_user,
            organisation=org2.id,
            invitation=None,
            approved=True,
        )
        mem_user2.email_verified = datetime.utcnow()
        session.add(mem_user2)

        session.commit()
        session.refresh(super_admin)
        session.refresh(mem_admin1)
        session.refresh(mem_admin2)
        session.refresh(mem_user1)
        session.refresh(mem_user2)

        self.super_admin = super_admin
        self.mem_admin1 = mem_admin1
        self.mem_admin2 = mem_admin2
        self.mem_user1 = mem_user1
        self.mem_user2 = mem_user2

        yield

        session.query(User).filter(User.email.in_(emails)).delete(
            synchronize_session=False
        )
        session.commit()

    async def test_archive_user_by_secretariat_admin(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        token = create_access_token(data={"email": self.super_admin.email})
        res = await client.put(
            f"/user/{self.mem_user1.id}/archive?archive=true",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["archived"] is True
        assert data["last_status_changed_by"] == self.super_admin.id
        assert data["last_status_changed_by_name"] == self.super_admin.name

    async def test_unarchive_user_by_secretariat_admin(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        token = create_access_token(data={"email": self.super_admin.email})
        res = await client.put(
            f"/user/{self.mem_user1.id}/archive?archive=false",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["archived"] is False
        assert data["last_status_changed_by"] == self.super_admin.id

    async def test_self_archive_prevention(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        token = create_access_token(data={"email": self.super_admin.email})
        res = await client.put(
            f"/user/{self.super_admin.id}/archive?archive=true",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res.status_code == 400
        data = res.json()
        assert data["detail"] == "You cannot archive your own account"

    async def test_member_admin_cannot_archive_secretariat_admin(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        token = create_access_token(data={"email": self.mem_admin1.email})
        res = await client.put(
            f"/user/{self.super_admin.id}/archive?archive=true",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res.status_code == 403

    async def test_member_admin_cannot_archive_other_org_user(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        token = create_access_token(data={"email": self.mem_admin1.email})
        res = await client.put(
            f"/user/{self.mem_user2.id}/archive?archive=true",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res.status_code == 403

    async def test_member_admin_can_archive_own_org_user(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        token = create_access_token(data={"email": self.mem_admin1.email})
        res = await client.put(
            f"/user/{self.mem_user1.id}/archive?archive=true",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["archived"] is True
        assert data["last_status_changed_by"] == self.mem_admin1.id

    async def test_get_all_users_archived_filter(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        token = create_access_token(data={"email": self.super_admin.email})
        # Archive mem_user1
        await client.put(
            f"/user/{self.mem_user1.id}/archive?archive=true",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )

        # Query archived=false
        res_active = await client.get(
            "/user?archived=false",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res_active.status_code == 200
        active_ids = [u["id"] for u in res_active.json()["data"]]
        assert self.mem_user1.id not in active_ids

        # Query archived=true
        res_archived = await client.get(
            "/user?archived=true",
            headers={"Authorization": f"Bearer {token.get('token')}"},
        )
        assert res_archived.status_code == 200
        archived_ids = [u["id"] for u in res_archived.json()["data"]]
        assert self.mem_user1.id in archived_ids
