import sys
import os
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from seeder.static.static_cascade import cascade_values
from seeder.static.static_nested import nested_values
from seeder.static.static_member_isco import member_values, isco_values
from models.user import User, UserRole
from models.reset_password import ResetPassword
from db import crud_member_type, crud_isco_type
from db import crud_organisation, crud_cascade
from middleware import verify_token
from datetime import timedelta
from tests.test_000_main import Acc

sys.path.append("..")


class TestUserAuthentication():
    def test_token_verification(self):
        account = Acc(email="support@akvo.org", token=None)
        assert account.token != ""
        assert account.decoded == account.data
        verify = verify_token(account.decoded)
        assert verify['exp'] > 0

    @pytest.mark.asyncio
    async def test_add_member_type(self, app: FastAPI, session: Session,
                                   client: AsyncClient) -> None:
        # create member type
        for m in member_values:
            payload = {"name": m}
            res = crud_member_type.add_member_type(session=session,
                                                   payload=payload)
        # get all member type
        res = await client.get(app.url_path_for("member_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert len(res) == len(member_values)

    @pytest.mark.asyncio
    async def test_add_isco_type(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # create isco type
        for i in isco_values:
            payload = {"name": i}
            res = crud_isco_type.add_isco_type(session=session,
                                               payload=payload)
        # get all isco type
        res = await client.get(app.url_path_for("isco_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert len(res) == len(isco_values)

    @pytest.mark.asyncio
    async def test_add_cascade(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        # create cascade
        res = crud_cascade.add_cascade(session=session, payload=cascade_values)
        res = res.serialize
        # get cascade by id
        res = await client.get(
            app.url_path_for("cascade:get_by_id", id=res['id']))
        assert res.status_code == 200
        res = res.json()
        assert len(res['cascades']) > 0

    @pytest.mark.asyncio
    async def test_add_nested_list(self, app: FastAPI, session: Session,
                                   client: AsyncClient) -> None:
        # create cascade
        res = crud_cascade.add_cascade(session=session, payload=nested_values)
        res = res.serialize
        # get cascade by id
        res = await client.get(
            app.url_path_for("cascade:get_by_id", id=res['id']))
        assert res.status_code == 200
        res = res.json()
        assert len(res['cascades']) > 0

    @pytest.mark.asyncio
    async def test_add_organisation(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        # create organisation
        payload = [{
            "code": None,
            "name": "staff Akvo",
            "active": True,
            "member_type": [1],
            "isco_type": [1],
        }, {
            "code": None,
            "name": "staff GISCO Secretariat",
            "active": True,
            "member_type": [1],
            "isco_type": [1],
        }, {
            "code": None,
            "name": "Organisation DISCO - Traders Member and DISCO isco",
            "active": True,
            "member_type": [4],
            "isco_type": [3],
        }]
        for p in payload:
            crud_organisation.add_organisation(session=session, payload=p)
        res = await client.get(app.url_path_for("organisation:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            'active': True,
            'code': None,
            'id': 1,
            'isco': ['All'],
            'isco_type': [1],
            'member': ['All'],
            'member_type': [1],
            'name': 'staff Akvo'
        }, {
            'active': True,
            'code': None,
            'id': 2,
            'isco': ['All'],
            'isco_type': [1],
            'member': ['All'],
            'member_type': [1],
            'name': 'staff GISCO Secretariat'
        }, {
            'active':
            True,
            'code':
            None,
            'id':
            3,
            'isco': ['DISCO'],
            'isco_type': [3],
            'member': ['DISCO - Traders'],
            'member_type': [4],
            'name':
            'Organisation DISCO - Traders Member and DISCO isco'
        }]

    @pytest.mark.asyncio
    async def test_user_register(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # create organisation
        user_payload = {
            "name": "John Doe",
            "email": "support@akvo.org",
            "phone_number": None,
            "password": "test",
            "role": UserRole.secretariat_admin.value,
            "organisation": 1,
            "questionnaires": [1],
        }
        res = await client.post(app.url_path_for("user:register"),
                                json=user_payload)
        assert res.status_code == 200
        invitation_link = session.query(User).filter(
            User.email == user_payload["email"]).first().invitation
        res = res.json()
        assert res == {
            "email": "support@akvo.org",
            "email_verified": None,
            "id": 1,
            "invitation": invitation_link,
            "name": "John Doe",
            "organisation": 1,
            "role": "secretariat_admin",
            "questionnaires": [1],
            "phone_number": None,
        }

    @pytest.mark.asyncio
    async def test_user_invitation(self, app: FastAPI, session: Session,
                                   client: AsyncClient) -> None:
        user = session.query(User).filter(
            User.email == "support@akvo.org").first()
        res = await client.get(
            app.url_path_for("user:invitation", invitation=user.invitation))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "invitation": user.invitation,
            "email": "support@akvo.org",
            "name": "John Doe",
        }
        res = await client.post(
            app.url_path_for("user:invitation", invitation=user.invitation),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={"password": "test"})
        res = res.json()
        assert res['access_token'] is not None
        assert res['token_type'] == 'bearer'
        user = session.query(User).filter(
            User.email == "support@akvo.org").first()
        session.flush()
        session.refresh(user)
        assert user.invitation is None

    @pytest.mark.asyncio
    async def test_verify_user_email(self, app: FastAPI, session: Session,
                                     client: AsyncClient) -> None:
        res = await client.put(app.url_path_for("user:verify_email", id=1))
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
                "username": "support@akvo.org",
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
        account = Acc(email="support@akvo.org", token=res['access_token'])
        assert account.token == res['access_token']

    @pytest.mark.asyncio
    async def test_user_forgot_password(self, app: FastAPI, session: Session,
                                        client: AsyncClient) -> None:
        user_payload = {"email": "support@akvo.org"}
        user = session.query(User).filter(
            User.email == user_payload["email"]).first()
        assert user.invitation is None
        res = await client.post(
            app.url_path_for("user:forgot-password"),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={
                "email": "support@akvo.org",
                "client_id": os.environ["CLIENT_ID"],
                "client_secret": os.environ["CLIENT_SECRET"]
            })
        assert res.status_code == 201
        reset_password = session.query(ResetPassword).filter(
            ResetPassword.user == user.id).first()
        res = await client.get(
            app.url_path_for("user:reset-password", url=reset_password.url))
        assert res.status_code == 200
        reset_password.valid -= timedelta(minutes=20)
        session.commit()
        session.flush()
        session.refresh(reset_password)
        res = await client.get(
            app.url_path_for("user:reset-password", url=reset_password.url))
        assert res.status_code == 410

    @pytest.mark.asyncio
    async def test_forgot_password_then_change(self, app: FastAPI,
                                               session: Session,
                                               client: AsyncClient) -> None:
        user_payload = {"email": "support@akvo.org"}
        user = session.query(User).filter(
            User.email == user_payload["email"]).first()
        assert user.invitation is None
        res = await client.post(
            app.url_path_for("user:forgot-password"),
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={
                "email": "support@akvo.org",
                "client_id": os.environ["CLIENT_ID"],
                "client_secret": os.environ["CLIENT_SECRET"]
            })
        assert res.status_code == 201
        reset_password = session.query(ResetPassword).filter(
            ResetPassword.user == user.id).first()
        res = await client.post(app.url_path_for("user:reset-password",
                                                 url=reset_password.url),
                                data={"password": "test"})
        assert res.status_code == 200
        res = await client.get(
            app.url_path_for("user:reset-password", url=reset_password.url))
        assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_get_user_me(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        account = Acc(email="support@akvo.org", token=None)
        res = await client.get(
            app.url_path_for("user:me"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res['email'] == "support@akvo.org"
