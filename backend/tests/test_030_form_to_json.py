import sys
import pytest
import json
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")


class TestFormToJson():
    @pytest.mark.asyncio
    async def test_get_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        # get form
        res = await client.get(
            app.url_path_for("form:get_webform_by_id", form_id=1))
        assert res.status_code == 200
        res = res.json()
        res = json.dumps(res, indent=2, sort_keys=False)
        # print(res)
