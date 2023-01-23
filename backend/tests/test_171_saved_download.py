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
    async def test_save_data_for_download_list(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        payload = [{
            "question": 14,
            "repeat_index": 0,
            "comment": None,
            "value": 110
        }]
        # direct submit without computed validation
        res = await client.post(
            app.url_path_for("data:create", form_id=4, submitted=1),
            params={"locked_by": 1},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 405
        # save data
        res = await client.post(
            app.url_path_for("data:create", form_id=4, submitted=0),
            params={"locked_by": 1},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 405
        # correct value
        payload = [{
            "question": 14,
            "repeat_index": 0,
            "comment": None,
            "value": 70
        }, {
            "question": 15,
            "repeat_index": 0,
            "comment": None,
            "value": 30
        }]
        # save data
        res = await client.post(
            app.url_path_for("data:create", form_id=4, submitted=0),
            params={"locked_by": 1},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res['id'] == 7

    @pytest.mark.asyncio
    async def test_get_saved_download_list(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # submitted
        res = await client.get(
            app.url_path_for("download:list"),
            params={"submitted": 1},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert len(res) > 0
        # saved
        res = await client.get(
            app.url_path_for("download:list"),
            params={"submitted": 0},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert len(res) > 0
        assert res[0] == {
            "id": 7,
            "uuid": None,
            "form": "Form with computed validation",
            "form_type": "project",
            "name": "",
            "organisation": "staff Akvo",
            "created_by": "John Doe",
            "created": today,
            "submitted_by": None,
            "submitted": None,
            "status": None,
            "expired": None,
        }

    @pytest.mark.asyncio
    async def test_request_download(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("download:request", data_id=7),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 201
        res = res.json()
        assert res == {
            "id": 2,
            "data": 7,
            "form_type": "project",
            "organisation": 1
        }
        # check status
        res = await client.get(
            app.url_path_for("download:list"),
            params={"submitted": 0},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res[0]["status"] == "pending"

    @pytest.mark.asyncio
    async def test_get_requested_download_list(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("download:requested_list"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] is not None
        assert res["total_page"] is not None
        assert len(res["data"]) > 0
        assert len(res["data"]) == 2
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
