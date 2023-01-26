import sys
import pytest
import db.crud_roadmap as crud
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
    async def test_get_roadmap_download_file(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        download = crud.get_data_by_id(session=session, id=1)
        id = download.id
        # download by not admin
        not_valid_account = Acc(email="wayan_invited@test.org", token=None)
        res = await client.get(
            app.url_path_for("roadmap:download_file", id=id),
            headers={"Authorization": f"Bearer {not_valid_account.token}"})
        assert res.status_code == 403
        # download by admin
        res = await client.get(
            app.url_path_for("roadmap:download_file", id=id),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_delete_roadmap_datapoint(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get roadmap webform
        res = await client.delete(
            app.url_path_for("roadmap:delete_datapoint", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204
