import sys
import pytest
import db.crud_download as crud
from datetime import datetime, timedelta
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
today = datetime.today().strftime("%B %d, %Y")
expired_date = datetime.utcnow() + timedelta(days=5)
expired_date = expired_date.strftime("%Y-%m-%d")


class TestSavedDownloadRoute():
    @pytest.mark.asyncio
    async def test_get_saved_download_list(self, app: FastAPI,
                                           session: Session,
                                           client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("download:list"),
            params={"submitted": 0},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert len(res) == 0
        assert res == []

    @pytest.mark.asyncio
    async def test_get_requested_download_list(self, app: FastAPI,
                                               session: Session,
                                               client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("download:requested_list"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] is not None
        assert res["total_page"] is not None
        assert len(res["data"]) > 0
        assert len(res["data"]) == 1
        download = crud.get_by_id(session=session, id=res["data"][0]["id"])
        assert res["data"][0] == {
            "id": 1,
            "uuid": str(download.uuid),
            "organisation": "staff Akvo",
            "form_type": "member",
            "request_by": 1,
            "request_by_name": "John Doe",
            "request_date": today,
            "status": "approved"
        }

    @pytest.mark.asyncio
    async def test_view_download_request(self, app: FastAPI, session: Session,
                                         client: AsyncClient) -> None:
        download = crud.get_by_id(session=session, id=1)
        uuid = str(download.uuid)
        # viewed by different isco secretariat admin
        not_valid_account = Acc(email="galih@test.org", token=None)
        res = await client.get(
            app.url_path_for("download:view", uuid=uuid),
            headers={"Authorization": f"Bearer {not_valid_account.token}"})
        assert res.status_code == 403
        # viewed by same isco secretariat admin
        res = await client.get(
            app.url_path_for("download:view", uuid=uuid),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_download_file(self, app: FastAPI, session: Session,
                                     client: AsyncClient) -> None:
        download = crud.get_by_id(session=session, id=1)
        uuid = str(download.uuid)
        not_valid_account = Acc(email="galih@test.org", token=None)
        res = await client.get(
            app.url_path_for("download:file", uuid=uuid),
            headers={"Authorization": f"Bearer {not_valid_account.token}"})
        assert res.status_code == 403
        res = await client.get(
            app.url_path_for("download:file", uuid=uuid),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
