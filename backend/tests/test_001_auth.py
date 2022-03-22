import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from seeder.static.static_cascade import cascade_values
from seeder.static.static_nested import nested_values
from seeder.static.static_member_isco import member_values, isco_values
from models.user import UserRole
from db import crud_member_type, crud_isco_type
from db import crud_organisation, crud_cascade
from middleware import verify_token
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
            res = crud_member_type.add_member_type(
                session=session, payload=payload)
        # get all member type
        res = await client.get(
                app.url_path_for("member_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert len(res) == len(member_values)

    @pytest.mark.asyncio
    async def test_add_isco_type(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # create isco type
        for i in isco_values:
            payload = {"name": i}
            res = crud_isco_type.add_isco_type(
                session=session, payload=payload)
        # get all isco type
        res = await client.get(
                app.url_path_for("isco_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert len(res) == len(isco_values)

    @pytest.mark.asyncio
    async def test_add_cascade(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        # create cascade
        res = crud_cascade.add_cascade(session=session,
                                       payload=cascade_values)
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
        res = crud_cascade.add_cascade(session=session,
                                       payload=nested_values)
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
        payload = {
            "code": None,
            "name": "staff Akvo",
            "active": True,
            "member_type": 1,
            "isco_type": [
                {
                    "organisation": None,
                    "isco_type": 1
                }
            ],
        }
        res = crud_organisation.add_organisation(
            session=session, payload=payload)
        res = await client.get(
            app.url_path_for("organisation:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "active": True,
            "code": None,
            "id": 1,
            "isco_type": [
                {
                    "id": 1,
                    "isco_type": 1,
                    "organisation": 1
                }
            ],
            "member_type": 1,
            "name": "staff Akvo",
            "users": []
        }

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
            "organisation": 1
        }
        res = await client.post(
            app.url_path_for("user:register"), json=user_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "email": "support@akvo.org",
            "email_verified": None,
            "id": 1,
            "name": "John Doe",
            "organisation": 1,
            "role": "secretariat_admin"
        }

    @pytest.mark.asyncio
    async def test_verify_user_email(self, app: FastAPI, session: Session,
                                     client: AsyncClient) -> None:
        res = await client.put(
            app.url_path_for("user:verify_email", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res['email_verified'] is not None

    @pytest.mark.asyncio
    async def test_user_login(self, app: FastAPI, session: Session,
                              client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("user:login"),
            params={"email": "support@akvo.org", "password": "test"})
        assert res.status_code == 200
        res = res.json()
        assert res['access_token'] is not None
        assert res['token_type'] == 'bearer'
        account = Acc(email="support@akvo.org", token=res['access_token'])
        assert account.token == res['access_token']

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
