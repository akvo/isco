import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime
from models.feedback import Feedback
from models.user import User, UserRole
from models.organisation import Organisation
from models.organisation_isco import OrganisationIsco
from models.isco_type import IscoType
from db.crud_feedback import get_feedback_for_export
from .test_000_main import Acc

pytestmark = pytest.mark.asyncio


class TestFeedbackDownload:
    @pytest.mark.asyncio
    async def test_get_feedback_for_export(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # 1. Setup Data
        # Add ISCO type first
        isco = session.query(IscoType).filter(IscoType.id == 1).first()
        if not isco:
            isco = IscoType(id=1, name="Test ISCO")
            session.add(isco)
            session.commit()

        # Explicitly create organisation to avoid NoneType errors
        org = Organisation(name="Test Org", code="TO", active=True)
        session.add(org)
        session.commit()
        session.refresh(org)

        # Add ISCO type for this organisation
        org_isco = OrganisationIsco(id=None, organisation=org.id, isco_type=1)
        session.add(org_isco)
        session.commit()

        user = User(
            email="test@example.com",
            password="password",
            name="Test User",
            phone_number="123456",
            role=UserRole.member_user,
            organisation=org.id,
            invitation=None,
            approved=True,
        )
        user.email_verified = datetime.now()
        session.add(user)
        session.commit()
        session.refresh(user)

        # Add feedback for this user
        monitoring_round = datetime.now().year
        f1 = Feedback(
            id=None,
            user=user.id,
            title="Feedback 1",
            category="questionnaire",
            content="Content 1",
            created=datetime.now(),
        )
        session.add(f1)
        session.commit()

        # 2. Test extraction without filters
        results = get_feedback_for_export(session)
        assert len(results) >= 1

        # 3. Test extraction with monitoring round filter
        results = get_feedback_for_export(
            session, monitoring_round=monitoring_round
        )
        assert len(results) >= 1

        # 4. Test extraction with ISCO filter
        results = get_feedback_for_export(session, isco_type_ids=[1])
        assert len(results) >= 1

        # 5. Test extraction with non-existent monitoring round
        results = get_feedback_for_export(session, monitoring_round=1999)
        assert len(results) == 0

    @pytest.mark.asyncio
    async def test_download_feedback_endpoint(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # 1. Setup Admin User
        admin_email = "admin@example.com"
        # Ensure org exists for admin (we can reuse or create new)
        org = Organisation(name="Admin Org", code="AO", active=True)
        session.add(org)
        session.commit()
        session.refresh(org)

        admin = User(
            email=admin_email,
            password="password",
            name="Admin User",
            phone_number="123456",
            role=UserRole.secretariat_admin,
            organisation=org.id,
            invitation=None,
            approved=True,
        )
        admin.email_verified = datetime.now()
        session.add(admin)
        session.commit()

        # Link admin to ISCO 1
        org_isco = OrganisationIsco(id=None, organisation=org.id, isco_type=1)
        session.add(org_isco)
        session.commit()

        # 2. Use Acc to get token
        account = Acc(email=admin_email, token=None)

        # 3. Call endpoint
        response = await client.get(
            app.url_path_for("feedback:download"),
            headers={"Authorization": f"Bearer {account.token}"},
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == (
            "application/vnd.openxmlformats-officedocument"
            ".spreadsheetml.sheet"
        )
        date_str = datetime.now().strftime("%Y%m%d")
        assert (
            f"attachment; filename=feedback_export_{date_str}.xlsx"
            in response.headers["content-disposition"]
        )

    @pytest.mark.asyncio
    async def test_member_admin_access(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # Setup ISCOs
        isco1 = session.query(IscoType).filter(IscoType.id == 2).first()
        if not isco1:
            isco1 = IscoType(id=2, name="ISCO 1")
            session.add(isco1)
        isco2 = session.query(IscoType).filter(IscoType.id == 3).first()
        if not isco2:
            isco2 = IscoType(id=3, name="ISCO 2")
            session.add(isco2)
        session.commit()

        # Setup member admin with ISCO 1
        org = Organisation(name="Member Org", code="MO", active=True)
        session.add(org)
        session.commit()
        session.refresh(org)

        org_isco = OrganisationIsco(id=None, organisation=org.id, isco_type=2)
        session.add(org_isco)
        session.commit()

        member_email = "member@example.com"
        member_admin = User(
            email=member_email,
            password="password",
            name="Member Admin",
            phone_number="123456",
            role=UserRole.member_admin,
            organisation=org.id,
            invitation=None,
            approved=True,
        )
        member_admin.email_verified = datetime.now()
        session.add(member_admin)
        session.commit()

        account = Acc(email=member_email, token=None)

        # Add feedback for this isco
        f1 = Feedback(
            id=None,
            user=member_admin.id,
            title="Member Feedback",
            category="questionnaire",
            content="Content from ISCO 1",
            created=datetime.now(),
        )
        session.add(f1)
        session.commit()

        # Test /isco_type/mine
        response = await client.get(
            app.url_path_for("isco_type:get_mine"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == 2

        # Test /feedback/download with member_admin (should be forbidden)
        response = await client.get(
            app.url_path_for("feedback:download"),
            params={"isco_type_id": 2},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert response.status_code == 403

        # Test /feedback/download with another ISCO (should still be forbidden)
        response = await client.get(
            app.url_path_for("feedback:download"),
            params={"isco_type_id": 3},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_secretariat_admin_respected_isco(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # 1. Setup Secretariat Admin with restricted ISCO access
        email = "secretariat_restricted@example.com"
        org = Organisation(name="Secretariat Org", code="SO", active=True)
        session.add(org)
        session.commit()
        session.refresh(org)

        # Only link to ISCO 2
        org_isco = OrganisationIsco(id=None, organisation=org.id, isco_type=2)
        session.add(org_isco)

        admin = User(
            email=email,
            password="password",
            name="Secretariat Restricted",
            phone_number="123456",
            role=UserRole.secretariat_admin,
            organisation=org.id,
            invitation=None,
            approved=True,
        )
        admin.email_verified = datetime.now()
        session.add(admin)
        session.commit()

        account = Acc(email=email, token=None)

        # 2. Test Access
        # Authorized ISCO
        response = await client.get(
            app.url_path_for("feedback:download"),
            params={"isco_type_id": 2},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert response.status_code == 200

        # Unauthorized ISCO
        response = await client.get(
            app.url_path_for("feedback:download"),
            params={"isco_type_id": 3},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert response.status_code == 403

        # Default (No isco_type_id) - should use respected list
        response = await client.get(
            app.url_path_for("feedback:download"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert response.status_code in [200, 404]
