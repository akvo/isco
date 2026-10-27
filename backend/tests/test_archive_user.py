import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from models.user import User, UserRole
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio

account = Acc(email=None, token=None)


class TestArchiveUserModel:
    def test_user_model_archived_fields_and_serialize(
        self, session: Session
    ) -> None:
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
            organisation=1,
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
            organisation=1,
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
