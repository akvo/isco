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


class TestFormRoutes():
    @pytest.mark.asyncio
    async def test_add_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        # create form
        res = await client.post(
            app.url_path_for("form:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json={"name": "Form Test",
                  "description": "Form Description",
                  "languages": None})
        assert res.status_code == 200
        res = res.json()
        assert res == {"created": datenow(),
                       "description": "Form Description",
                       "id": 1,
                       "languages": None,
                       "name": "Form Test",
                       "published": None,
                       "url": None,
                       "version": 0.0}

    @pytest.mark.asyncio
    async def test_update_form(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update form
        res = await client.put(
            app.url_path_for("form:put", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json={"name": "Form Test",
                  "description": "Form Description",
                  "languages": ["id"]})
        assert res.status_code == 200
        res = res.json()
        assert res == {"created": datenow(),
                       "description": "Form Description",
                       "id": 1,
                       "languages": ["id"],
                       "name": "Form Test",
                       "published": None,
                       "url": None,
                       "version": 0.0}
