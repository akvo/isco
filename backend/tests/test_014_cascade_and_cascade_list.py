import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.cascade import CascadeType
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestCascadeAndCascadeListRoutes():
    @pytest.mark.asyncio
    async def test_add_cascade(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        # add cascade
        cascade_payload = {
            "name": "Cascade 1",
            "type": CascadeType.cascade.value,
            "cascades": [{
                "cascade": None,
                "parent": None,
                "code": None,
                "name": "Parent 1",
                "path": None,
                "level": 0
            }],
        }
        res = await client.post(
            app.url_path_for("cascade:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascades": [{
                "cascade": 3,
                "code": None,
                "id": 26,
                "level": 0,
                "name": "Parent 1",
                "parent": None,
                "path": None
            }],
            "id": 3,
            "name": "Cascade 1",
            "type": "cascade",
        }

    @pytest.mark.asyncio
    async def test_update_cascade(self, app: FastAPI, session: Session,
                                  client: AsyncClient) -> None:
        # get cascade
        res = await client.get(app.url_path_for("cascade:get_by_id", id=3))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 3
        # update cascade
        cascade_payload = {
            "name": "Cascade 1 Updated",
            "type": CascadeType.cascade.value,
            "cascades": None,
        }
        res = await client.put(
            app.url_path_for("cascade:put", id=3),
            headers={"Authorization": f"Bearer {account.token}"},
            json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 3,
            "name": "Cascade 1 Updated",
            "type": "cascade"
        }

    @pytest.mark.asyncio
    async def test_add_cascade_list(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        # get cascade
        res = await client.get(app.url_path_for("cascade:get_by_id", id=3))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 3
        # add cascade list
        cascade_payload = {
            "cascade": 3,
            "parent": None,
            "code": None,
            "name": "Parent 2",
            "path": None,
            "level": 0
        }
        res = await client.post(
            app.url_path_for("cascade_list:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": 3,
            "code": None,
            "id": 27,
            "level": 0,
            "name": "Parent 2",
            "parent": None,
            "path": None
        }

    @pytest.mark.asyncio
    async def test_update_cascade_list(self, app: FastAPI, session: Session,
                                       client: AsyncClient) -> None:
        # get cascade list
        res = await client.get(
            app.url_path_for("cascade_list:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # add cascade list
        cascade_payload = {
            "cascade": 1,
            "parent": None,
            "code": "P1",
            "name": "Parent 1 Updated",
            "path": None,
            "level": 0
        }
        res = await client.put(
            app.url_path_for("cascade_list:put", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": 1,
            "code": "P1",
            "id": 1,
            "level": 0,
            "name": "Parent 1 Updated",
            "parent": None,
            "path": None
        }
