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


class TestDownloadRoute():
    @pytest.mark.asyncio
    async def test_get_download_list(self, app: FastAPI, session: Session,
                                     client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("download:list"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert len(res) > 0
        assert res[0] == {
            'id': 1,
            'uuid': None,
            'form': "Form Test",
            'form_type': "member",
            'name': 'Depend to Q1 Option 1',
            'organisation': 'Akvo',
            'submitted': today,
            'submitted_by': 'John Doe',
            'created': today,
            'status': None,
            'created_by': 'John Doe',
            'expired': None
        }

    @pytest.mark.asyncio
    async def test_request_download(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("download:request", data_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 201
        res = res.json()
        assert res == {"id": 1, "data": 1, "form": 1, "organisation": 1}

        res = await client.get(
            app.url_path_for("download:list"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        assert res.status_code == 200
        res = res.json()
        assert res[0]["status"] == "pending"

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
            "organisation": "Akvo",
            "form_type": "member",
            "request_by": 1,
            "request_by_name": "John Doe",
            "request_date": today,
            "status": "pending"
        }

    @pytest.mark.asyncio
    async def test_view_download_request(self, app: FastAPI,
                                         session: Session,
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
    async def test_approve_download_request(self, app: FastAPI,
                                            session: Session,
                                            client: AsyncClient) -> None:
        download = crud.get_by_id(session=session, id=1)
        uuid = str(download.uuid)
        # approved by different isco secretariat admin
        not_valid_account = Acc(email="galih@test.org", token=None)
        res = await client.put(
            app.url_path_for("download:update", uuid=uuid),
            headers={"Authorization": f"Bearer {not_valid_account.token}"},
            params={"approved": 1})
        assert res.status_code == 403
        # approved by same isco secretariat admin
        res = await client.put(
            app.url_path_for("download:update", uuid=uuid),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"approved": 1})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "uuid": str(download.uuid),
            "organisation": "Akvo",
            "form_type": "member",
            "request_by": 1,
            "request_by_name": "John Doe",
            "request_date": today,
            "status": "approved"
        }
        # get download list after approved
        res = await client.get(
            app.url_path_for("download:list"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        expired = res[0]['expired'].split('T')[0]
        assert expired == expired_date

    @pytest.mark.asyncio
    async def test_get_download_file(self, app: FastAPI,
                                     session: Session,
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
