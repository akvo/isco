import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestOptionRoutes():
    @pytest.mark.asyncio
    async def test_add_option(self, app: FastAPI, session: Session,
                              client: AsyncClient) -> None:
        # get question
        res = await client.get(app.url_path_for("question:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # add option
        option_payload = {
            "code": None,
            "name": "Option 1",
            "translations": None,
            "question": 1,
            "order": None
        }
        res = await client.post(
            app.url_path_for("option:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=option_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "code": None,
            "id": 1,
            "name": "Option 1",
            "order": None,
            "question": 1,
            "translations": []
        }

    @pytest.mark.asyncio
    async def test_update_option(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # get option
        res = await client.get(app.url_path_for("option:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update option
        option_payload = {
            "code": "opt1",
            "name": "Option 1",
            "translations": [
                {"language": "id", "text": "Pilihan 1"}],
            "question": 1,
            "order": 1,
        }
        res = await client.put(
            app.url_path_for("option:put", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json=option_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "code": "opt1",
            "id": 1,
            "name": "Option 1",
            "order": 1,
            "question": 1,
            "translations": [
                {"language": "id", "text": "Pilihan 1"}]
        }
