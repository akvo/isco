import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from seeder.member_isco_type import member_values, isco_values
from models.user import UserRole

pytestmark = pytest.mark.asyncio
sys.path.append("..")


class TestOrganisationRoutes():
    @pytest.mark.asyncio
    async def test_add_member_type(self, app: FastAPI, session: Session,
                                   client: AsyncClient) -> None:
        # create member type
        for m in member_values:
            res = await client.post(
                app.url_path_for("member_type:create"),
                json={"name": m})
            assert res.status_code == 200
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
            res = await client.post(
                app.url_path_for("isco_type:create"),
                json={"name": "ISCO"})
            assert res.status_code == 200
        # get all isco type
        res = await client.get(
                app.url_path_for("isco_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert len(res) == len(isco_values)

    @pytest.mark.asyncio
    async def test_add_organisation(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        # create organisation
        org_payload = {
            "organisation": {
                "code": None,
                "name": "Akvo",
                "active": True,
                "member_type": 1,
            },
            "isco_type": [
                {
                    "organisation": None,
                    "isco_type": 1
                }
            ]
        }
        res = await client.post(
            app.url_path_for("organisation:create"), json=org_payload)
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
            "name": "Akvo",
            "users": []
        }

    @pytest.mark.asyncio
    async def test_update_organisation(self, app: FastAPI, session: Session,
                                       client: AsyncClient) -> None:
        # get organisation
        res = await client.get(
            app.url_path_for("organisation:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update organisation
        org_payload = {
            "code": "Akvo",
            "name": "Akvo",
            "active": True,
            "member_type": 1
        }
        res = await client.put(
            app.url_path_for("organisation:put", id=1), json=org_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "active": True,
            "code": "Akvo",
            "id": 1,
            "member_type": 1,
            "name": "Akvo"
        }

    @pytest.mark.asyncio
    async def test_register_user(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # create organisation
        user_payload = {
            "name": "John Doe",
            "email": "mail@mail.test",
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
            "email": "mail@mail.test",
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
