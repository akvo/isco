import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")


class TestFormRoutes():
    @pytest.mark.asyncio
    async def test_add_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("form:create"),
            json={"name": "Form Test", "languages": ["en"]})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1, "languages": ["en"], "name": "Form Test"}

    @pytest.mark.asyncio
    async def test_update_form(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        res = await client.put(
            app.url_path_for("form:put", id=1),
            json={"name": "Form Test", "languages": ["en", "id"]})
        assert res.status_code == 200
        res = res.json()
        assert res == {"id": 1, "languages": ["en", "id"], "name": "Form Test"}
