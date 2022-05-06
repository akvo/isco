import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


def datenow():
    now = datetime.utcnow()
    return now.strftime("%d-%m-%Y")


class TestLoadData():
    @pytest.mark.asyncio
    async def test_get_all_user(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        not_super_admin = Acc(email="wayan_invited@test.org", token=None)
        res = await client.get(
            app.url_path_for("user:get_all"),
            headers={"Authorization": f"Bearer {not_super_admin.token}"})
        assert res.status_code == 403
        res = await client.get(
            app.url_path_for("user:get_all"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "data" in res
        assert "total" in res
        assert "total_page" in res
        assert "email" in res["data"][0]
        assert "email_verified" in res["data"][0]
        assert "id" in res["data"][0]
        assert "name" in res["data"][0]
        assert "organisation" in res["data"][0]
        assert "role" in res["data"][0]
        # get pending user
        res = await client.get(
            app.url_path_for("user:get_all"),
            params={"approved": 0},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 404
        # filter by organisation not in same isco
        res = await client.get(
            app.url_path_for("user:get_all"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"organisation": [3]})
        assert res.status_code == 403
        # filter by organisation in same isco
        res = await client.get(
            app.url_path_for("user:get_all"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"organisation": [1]})
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_all_member(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(app.url_path_for("member_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert res[0] == {"id": 1, "name": "All"}

    @pytest.mark.asyncio
    async def test_get_all_isco(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(app.url_path_for("isco_type:get_all"))
        assert res.status_code == 200
        res = res.json()
        assert res[0] == {"id": 1, "name": "All"}

    @pytest.mark.asyncio
    async def test_get_organisation_in_same_isco(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("organisation:get_organisation_in_same_isco"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            'id': 1,
            'code': 'Akvo',
            'name': 'Akvo',
            'active': True,
            'member_type': [1],
            'member': ['All'],
            'isco_type': [1],
            'isco': ['All']
        }, {
            'id': 2,
            'code': None,
            'name': 'staff GISCO Secretariat',
            'active': True,
            'member_type': [1],
            'member': ['All'],
            'isco_type': [1],
            'isco': ['All']
        }]

    @pytest.mark.asyncio
    async def test_get_paginated_organisation(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get all organisation without filter
        res = await client.get(app.url_path_for("organisation:get_paginated"))
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "data" in res
        assert "total" in res
        assert "total_page" in res
        # get all organisation with filter by organisation
        res = await client.get(
            app.url_path_for("organisation:get_paginated"),
            params={"organisation": [1, 2]})
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "data" in res
        assert "total" in res
        assert "total_page" in res
        assert [d['id'] for d in res["data"]] == [1, 2]
        # get all organisation with filter by member
        res = await client.get(
            app.url_path_for("organisation:get_paginated"),
            params={"member": [4]})
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "data" in res
        assert "total" in res
        assert "total_page" in res
        assert 4 in res["data"][0]["member_type"]
        # get all organisation with filter by isco
        res = await client.get(
            app.url_path_for("organisation:get_paginated"),
            params={"isco": [3]})
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "data" in res
        assert "total" in res
        assert "total_page" in res
        assert 3 in res["data"][0]["isco_type"]
        # get all organisation with filter by member & isco
        res = await client.get(
            app.url_path_for("organisation:get_paginated"),
            params={"member": [4], "isco": [3]})
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "data" in res
        assert "total" in res
        assert "total_page" in res
        assert 4 in res["data"][0]["member_type"]
        assert 3 in res["data"][0]["isco_type"]
        # get all organisation with all filter
        res = await client.get(
            app.url_path_for("organisation:get_paginated"),
            params={"organisation": [1, 2, 3], "member": [4], "isco": [3]})
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "data" in res
        assert "total" in res
        assert "total_page" in res
        assert [d['id'] for d in res["data"]] == [3]
        assert 4 in res["data"][0]["member_type"]
        assert 3 in res["data"][0]["isco_type"]
