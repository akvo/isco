import sys
import os
import pytest
import json
import asyncio
from unittest.mock import patch
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.user import UserRole, User
from models.organisation import Organisation
from models.member_type import MemberType
from models.isco_type import IscoType
from models.organisation_member import OrganisationMember
from models.organisation_isco import OrganisationIsco
from models.form import Form
from models.question_group import QuestionGroup
from models.question import Question, QuestionType
from models.answer import Answer
from models.data import Data
from models.feedback import FeedbackCategory
from models.download import Download
from middleware import get_password_hash, create_access_token, decode_token
from datetime import datetime

sys.path.append("..")


class Acc:
    def __init__(self, email, token=None):
        self.email = email if email else "support@akvo.org"
        self.data = {"email": self.email}
        if token:
            self.token = token
        else:
            token_data = create_access_token(data=self.data)
            self.token = token_data.get("token")
        self.decoded = decode_token(self.token)


def ensure_setup(session: Session):
    # Ensure TESTING is True for internal consistency
    os.environ["TESTING"] = "True"

    # Create dummy form json file
    dummy_path = "/tmp/dummy_form.json"
    with open(dummy_path, "w") as f:
        json.dump({"name": "Testing Form", "question_group": []}, f)

    # Seed Member Type
    if not session.query(MemberType).filter(MemberType.id == 1).first():
        mt = MemberType(id=1, name="All")
        session.add(mt)
        session.commit()
    # Seed ISCO Type
    if not session.query(IscoType).filter(IscoType.id == 1).first():
        it = IscoType(id=1, name="All")
        session.add(it)
        session.commit()

    # Seed Organisations
    for i in [1, 2]:
        org = session.query(Organisation).filter(Organisation.id == i).first()
        if not org:
            code = "AKVO" if i == 1 else "GISCO"
            name = "staff Akvo" if i == 1 else "staff GISCO Secretariat"
            new_org = Organisation(name=name, code=code, active=True)
            new_org.id = i
            session.add(new_org)
            session.commit()

            # Seed Mappings
            if (
                not session.query(OrganisationMember)
                .filter(
                    OrganisationMember.organisation == i,
                    OrganisationMember.member_type == 1,
                )
                .first()
            ):
                om = OrganisationMember(id=None, organisation=i, member_type=1)
                session.add(om)
            if (
                not session.query(OrganisationIsco)
                .filter(
                    OrganisationIsco.organisation == i,
                    OrganisationIsco.isco_type == 1,
                )
                .first()
            ):
                oi = OrganisationIsco(id=None, organisation=i, isco_type=1)
                session.add(oi)
            session.commit()

    # Seed Admin User (in Org 1)
    admin = (
        session.query(User).filter(User.email == "support@akvo.org").first()
    )
    if not admin:
        admin = User(
            email="support@akvo.org",
            password=get_password_hash("test"),
            name="Admin",
            phone_number="",
            role=UserRole.secretariat_admin,
            organisation=1,
            invitation=None,
            approved=True,
        )
        admin.email_verified = datetime.utcnow()
        session.add(admin)
        session.commit()
    else:
        admin.email_verified = datetime.utcnow()
        admin.approved = True
        session.commit()

    # Seed a User in Org 2 (for collaborator tests)
    collab_user = (
        session.query(User).filter(User.email == "collab@akvo.org").first()
    )
    if not collab_user:
        collab_user = User(
            email="collab@akvo.org",
            password=get_password_hash("test"),
            name="Collab User",
            phone_number="",
            role=UserRole.member_user,
            organisation=2,
            invitation=None,
            approved=True,
        )
        collab_user.email_verified = datetime.utcnow()
        session.add(collab_user)
        session.commit()

    # Seed Form
    form = session.query(Form).filter(Form.id == 1).first()
    if not form:
        form = Form(
            id=1,
            name="Testing Form",
            description="Regression Test Form",
            enable_prefilled_value=False,
            languages=["en"],
        )
        form.url = dummy_path
        session.add(form)
        session.commit()

    # Seed Question Group
    qg = session.query(QuestionGroup).filter(QuestionGroup.id == 1).first()
    if not qg:
        qg = QuestionGroup(
            id=1,
            form=1,
            name="Test Group",
            translations=None,
            repeat=False,
            order=1,
            description="Test Description",
            repeat_text=None,
            leading_question=None,
            show_repeat_in_question_level=False,
        )
        session.add(qg)
        session.commit()

    # Seed Question
    q = session.query(Question).filter(Question.id == 1).first()
    if not q:
        q = Question(
            id=1,
            name="Test Question",
            form=1,
            question_group=1,
            translations=None,
            mandatory=True,
            datapoint_name=True,
            variable_name="test_q",
            type=QuestionType.input,
            personal_data=False,
            rule=None,
            tooltip="Test Tooltip",
            cascade=None,
            tooltip_translations=None,
            repeating_objects=None,
            order=1,
            core_mandatory=False,
            deactivate=False,
            autofield=None,
        )
        session.add(q)
        session.commit()

    # Seed Data (ID 1)
    data = session.query(Data).filter(Data.id == 1).first()
    if not data:
        new_data = Data(
            name="Test Data",
            form=1,
            geo=[1.0, 1.0],
            locked_by=None,
            created_by=admin.id,
            organisation=1,
            submitted_by=None,
            updated=datetime.utcnow(),
            created=datetime.utcnow(),
            submitted=None,
        )
        new_data.id = 1
        session.add(new_data)
        session.commit()
    else:
        data.submitted = None
        data.submitted_by = None
        session.commit()

    # Seed Answer
    ans = (
        session.query(Answer)
        .filter(Answer.data == 1, Answer.question == 1)
        .first()
    )
    if not ans:
        ans = Answer(
            question=1, data=1, text="Test Answer", created=datetime.utcnow()
        )
        session.add(ans)
        session.commit()


@pytest.mark.asyncio
@patch("util.mailer.Email.send", autospec=True)
class TestEmailRegression:

    async def test_01_registration_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.return_value = True

        user_payload = {
            "name": "Email Tester",
            "email": "tester@akvo.org",
            "phone_number": "",
            "password": "test",
            "role": UserRole.member_user.value,
            "organisation": 1,
            "questionnaires": [1],
        }

        res = await client.post(
            app.url_path_for("user:register"), data=user_payload
        )
        assert res.status_code == 200, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "tester@akvo.org" == payload["Recipients"][0]["Email"]
        assert "Email Verification" in payload["Subject"]

    async def test_02_registration_notification_to_admin(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        mock_send.return_value = True

        # routes/user.py:261 skips notification if TESTING is on.
        # But if TESTING is OFF, it decodes the token passed in 'email' param.
        token = create_access_token({"email": "tester@akvo.org"}).get("token")

        with patch.dict(os.environ, {"TESTING": ""}):
            res = await client.put(
                app.url_path_for("user:verify_email"), params={"email": token}
            )
            assert res.status_code == 200, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert any(
            r["Email"] == "support@akvo.org" for r in payload["Recipients"]
        )
        assert "Registration" in payload["Subject"]

    async def test_03_invitation_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        mock_send.return_value = True
        user_payload = {
            "name": "Invited User",
            "email": "invited@akvo.org",
            "phone_number": "",
            "password": "test",
            "role": UserRole.member_user.value,
            "organisation": 1,
            "questionnaires": [1],
        }
        # invitation param is Optional[bool] = False in route,
        # picked as query param.
        admin_account = Acc(email="support@akvo.org")
        res = await client.post(
            app.url_path_for("user:register"),
            data=user_payload,
            params={"invitation": "true"},
            headers={"Authorization": f"Bearer {admin_account.token}"},
        )
        assert res.status_code == 200, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "invited@akvo.org" == payload["Recipients"][0]["Email"]
        assert "Invitation" in payload["Subject"]

    async def test_04_forgot_password_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        mock_send.return_value = True
        res = await client.post(
            app.url_path_for("user:forgot-password"),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={
                "email": "tester@akvo.org",
                "client_id": os.environ["CLIENT_ID"],
                "client_secret": os.environ["CLIENT_SECRET"],
            },
        )
        assert res.status_code == 201, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "tester@akvo.org" == payload["Recipients"][0]["Email"]
        assert "Password Reset" in payload["Subject"]

    async def test_05_user_approval_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        admin_account = Acc(email="support@akvo.org")
        mock_send.return_value = True

        user = (
            session.query(User).filter(User.email == "tester@akvo.org").first()
        )
        user.email_verified = datetime.utcnow()
        session.commit()

        user_payload = {
            "role": UserRole.member_user.value,
            "organisation": 1,
            "questionnaires": [1],
        }
        res = await client.put(
            app.url_path_for("user:update_by_admin", id=user.id),
            headers={"Authorization": f"Bearer {admin_account.token}"},
            params={"approved": 1},
            json=user_payload,
        )
        assert res.status_code == 200, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "tester@akvo.org" == payload["Recipients"][0]["Email"]
        assert "User Signup approved" in payload["Subject"]

    async def test_06_data_download_request_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        admin_account = Acc(email="support@akvo.org")
        mock_send.return_value = True

        res = await client.post(
            app.url_path_for("download:request", data_id="1"),
            headers={"Authorization": f"Bearer {admin_account.token}"},
        )
        assert res.status_code == 201, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "Data Download Request" in payload["Subject"]

    async def test_07_data_download_approval_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        admin_account = Acc(email="support@akvo.org")
        mock_send.return_value = True

        # Create a download request
        res_req = await client.post(
            app.url_path_for("download:request", data_id="1"),
            headers={"Authorization": f"Bearer {admin_account.token}"},
        )
        assert res_req.status_code == 201

        # Refresh session to see the download
        session.expire_all()
        download = session.query(Download).first()
        assert download is not None

        res = await client.put(
            app.url_path_for("download:update", uuid=download.uuid),
            headers={"Authorization": f"Bearer {admin_account.token}"},
            params={"approved": True},
        )
        assert res.status_code == 200, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "Data Download Approved" in payload["Subject"]

    async def test_08_add_collaborator_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        admin_account = Acc(email="support@akvo.org")
        mock_send.return_value = True

        res = await client.post(
            app.url_path_for("collaborator:create", data="1"),
            json=[{"organisation": 2}],
            headers={"Authorization": f"Bearer {admin_account.token}"},
        )
        assert res.status_code == 200, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "Organisation added as collaborator" in payload["Subject"]

    async def test_09_submission_completed_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        admin_account = Acc(email="support@akvo.org")
        mock_send.return_value = True

        # Ensure data is NOT yet submitted
        data = session.query(Data).filter(Data.id == 1).first()
        data.submitted = None
        data.submitted_by = None
        session.commit()

        res = await client.put(
            app.url_path_for("data:update", id=1, submitted=1),
            json=[],
            headers={"Authorization": f"Bearer {admin_account.token}"},
        )
        assert res.status_code == 200, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "Submission Completed" in payload["Subject"]

    async def test_10_feedback_email(
        self, mock_send, app: FastAPI, session: Session, client: AsyncClient
    ):
        ensure_setup(session)
        mock_send.reset_mock()
        admin_account = Acc(email="support@akvo.org")
        mock_send.return_value = True

        feedback_payload = {
            "title": "Regression Test Feedback",
            "category": FeedbackCategory.other.value,
            "content": "This is a test feedback",
        }
        res = await client.post(
            app.url_path_for("feedback:create"),
            json=feedback_payload,
            headers={"Authorization": f"Bearer {admin_account.token}"},
        )
        assert res.status_code == 200, res.text

        await asyncio.sleep(0.7)
        assert mock_send.called
        email_obj = mock_send.call_args[0][0]
        payload = email_obj.data
        assert "New Feedback" in payload["Subject"]
