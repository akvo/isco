import sys
import pytest
import db.crud_download as crud
from datetime import datetime, timedelta
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session
from models.download import DownloadStatusType

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
today = datetime.today().strftime("%B %d, %Y")
expired_date = datetime.utcnow() + timedelta(days=5)
expired_date = expired_date.strftime("%Y-%m-%d")


class TestDownloadRoute:
    @pytest.mark.asyncio
    async def test_get_download_list(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("download:list"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert len(res) > 0
        assert res[0] == {
            "id": 1,
            "uuid": None,
            "form": "Form Test",
            "form_type": "member",
            "name": "Option 1 - Option 1",
            "organisation": "staff Akvo",
            "submitted": today,
            "submitted_by": "John Doe",
            "created": today,
            "status": None,
            "created_by": "John Doe",
            "expired": None,
        }

    @pytest.mark.asyncio
    async def test_request_download(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for("download:request", data_id=1),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 201
        res = res.json()
        assert res == {
            "id": 1,
            "data": 1,
            "form_type": "member",
            "organisation": 1,
        }

        res = await client.get(
            app.url_path_for("download:list"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res[0]["status"] == "pending"

    @pytest.mark.asyncio
    async def test_download_list_filter_by_status(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # request
        res = await client.get(
            app.url_path_for("download:list"),
            params={
                "status": DownloadStatusType.request.value,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res[0]["status"] is None

        # pending
        res = await client.get(
            app.url_path_for("download:list"),
            params={
                "status": DownloadStatusType.pending.value,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res[0]["status"] == "pending"

        # approved
        res = await client.get(
            app.url_path_for("download:list"),
            params={
                "status": DownloadStatusType.approved.value,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == []

        # rejected
        res = await client.get(
            app.url_path_for("download:list"),
            params={
                "status": DownloadStatusType.rejected.value,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == []

        # expired
        res = await client.get(
            app.url_path_for("download:list"),
            params={
                "status": DownloadStatusType.expired.value,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == []

    @pytest.mark.asyncio
    async def test_get_requested_download_list(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("download:requested_list"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
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
            "status": "pending",
        }

    @pytest.mark.asyncio
    async def test_get_requested_download_list_by_organisation(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("download:requested_list"),
            params={"organisation": 2},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404

        res = await client.get(
            app.url_path_for("download:requested_list"),
            params={"organisation": 1},
            headers={"Authorization": f"Bearer {account.token}"},
        )
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
            "status": "pending",
        }

    @pytest.mark.asyncio
    async def test_get_requested_download_list_by_status(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("download:requested_list"),
            params={"status": DownloadStatusType.approved.value},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404

        res = await client.get(
            app.url_path_for("download:requested_list"),
            params={"status": DownloadStatusType.pending.value},
            headers={"Authorization": f"Bearer {account.token}"},
        )
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
            "status": "pending",
        }

    @pytest.mark.asyncio
    async def test_view_download_request(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        download = crud.get_by_id(session=session, id=1)
        uuid = str(download.uuid)
        # viewed by different isco secretariat admin
        not_valid_account = Acc(email="galih@test.org", token=None)
        res = await client.get(
            app.url_path_for("download:view", uuid=uuid),
            headers={"Authorization": f"Bearer {not_valid_account.token}"},
        )
        assert res.status_code == 403
        # viewed by same isco secretariat admin
        res = await client.get(
            app.url_path_for("download:view", uuid=uuid),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_approve_download_request(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        download = crud.get_by_id(session=session, id=1)
        uuid = str(download.uuid)
        # approved by different isco secretariat admin
        not_valid_account = Acc(email="galih@test.org", token=None)
        res = await client.put(
            app.url_path_for("download:update", uuid=uuid),
            headers={"Authorization": f"Bearer {not_valid_account.token}"},
            params={"approved": 1},
        )
        assert res.status_code == 403
        # approved by same isco secretariat admin
        res = await client.put(
            app.url_path_for("download:update", uuid=uuid),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"approved": 1},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "uuid": str(download.uuid),
            "organisation": "staff Akvo",
            "form_type": "member",
            "request_by": 1,
            "request_by_name": "John Doe",
            "request_date": today,
            "status": "approved",
        }
        # get download list after approved
        res = await client.get(
            app.url_path_for("download:list"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        expired = res[0]["expired"].split("T")[0]
        assert expired == expired_date

    @pytest.mark.asyncio
    async def test_get_download_file(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        download = crud.get_by_id(session=session, id=1)
        uuid = str(download.uuid)
        not_valid_account = Acc(email="galih@test.org", token=None)
        res = await client.get(
            app.url_path_for("download:file", uuid=uuid),
            headers={"Authorization": f"Bearer {not_valid_account.token}"},
        )
        assert res.status_code == 403
        res = await client.get(
            app.url_path_for("download:file", uuid=uuid),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_download_list_filter_by_status_approved(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # approved
        res = await client.get(
            app.url_path_for("download:list"),
            params={
                "status": DownloadStatusType.approved.value,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res[0]["status"] == DownloadStatusType.approved.value

    @pytest.mark.asyncio
    async def test_get_requested_download_list_by_status_approved(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("download:requested_list"),
            params={"status": DownloadStatusType.approved.value},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "current": 1,
            "data": [
                {
                    "form_type": "member",
                    "id": 1,
                    "organisation": "staff Akvo",
                    "request_by": 1,
                    "request_by_name": "John Doe",
                    "request_date": res["data"][0]["request_date"],
                    "status": "approved",
                    "uuid": res["data"][0]["uuid"],
                }
            ],
            "total": 1,
            "total_page": 1,
        }

        res = await client.get(
            app.url_path_for("download:requested_list"),
            params={"status": DownloadStatusType.pending.value},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404
