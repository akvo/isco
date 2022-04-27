import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
today = datetime.today().strftime("%B %d, %Y")


class TestDownloadRoute():
    @pytest.mark.asyncio
    async def test_get_download_list(self, app: FastAPI, session: Session,
                                     client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("download:list"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] is not None
        assert res["total_page"] is not None
        assert len(res["data"]) > 0
        assert res["data"][0] == {
            'id': 1,
            'form': "Form Test",
            'form_type': "member",
            'name': 'Depend to Q1 Option 1',
            'organisation': 'Akvo',
            'submitted': today,
            'submitted_by': 'John Doe',
            'created': today,
            'status': None,
            'created_by': 'John Doe',
        }

    @pytest.mark.asyncio
    async def test_request_download(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("download:request", data_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 201
        res = res.json()
        assert res == {"id": 1, "data": 1, "form": 1}

        res = await client.get(
            app.url_path_for("download:list"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        assert res.status_code == 200
        res = res.json()
        assert res["data"][0]["status"] == "pending"
