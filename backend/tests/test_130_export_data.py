import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session
from sqlalchemy import null
from models.data import Data
from datetime import datetime

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)


class TestDownloadRoute:
    @pytest.mark.asyncio
    async def test_generate_and_otp_check(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        data = session.query(Data).filter(Data.submitted != null()).first()
        # test data not available
        res = await client.post(
            app.url_path_for("download_summary:generate"),
            params={"form_id": 10, "member_type": 2},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404
        # test data not available
        res = await client.post(
            app.url_path_for("download_summary:generate"),
            params={"form_id": data.form, "monitoring_round": 1990},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        # test data available
        res = await client.post(
            app.url_path_for("download_summary:generate"),
            params={
                "form_id": data.form,
                "monitoring_round": datetime.now().year,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        # test data available
        res = await client.post(
            app.url_path_for("download_summary:generate"),
            params={"form_id": data.form},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert "uuid" in res
        uuid = res["uuid"]
        code = res["code"]
        # test invalid otp
        res = await client.post(
            app.url_path_for("download_summary:file", uuid=uuid),
            data={"code": 12345},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404
        # test valid otp
        res = await client.post(
            app.url_path_for("download_summary:file", uuid=uuid),
            data={"code": code},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
