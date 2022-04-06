import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestOrganisationRoutes():
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
            "member_type": 1,
            "isco_type": [],
        }
        res = await client.put(
            app.url_path_for("organisation:put", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json=org_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "active": True,
            "code": "Akvo",
            "id": 1,
            "isco": ["All"],
            "isco_type": [1],
            "member": "All",
            "member_type": 1,
            "name": "Akvo"
        }

    @pytest.mark.asyncio
    async def test_filter_user_by_member(self, app: FastAPI, session: Session,
                                         client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("user:filter_by_member_type", member_type=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert len(res) > 0
