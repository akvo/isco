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


class TestLoadSubmission():
    @pytest.mark.asyncio
    async def test_submission_progress(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            'organisation': 'Akvo',
            'form': 1,
            'form_type': 'member',
            'submitted': True,
            'count': 1
        }]
        not_super_admin = Acc(email="wayan_invited@test.org", token=None)
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {not_super_admin.token}"})
        assert res.status_code == 403
