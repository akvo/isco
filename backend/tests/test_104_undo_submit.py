import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session
from sqlalchemy import null
from models.data import Data

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)


class TestUndoSubmission():
    @pytest.mark.asyncio
    async def test_undo_submission(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        data = session.query(Data).filter(
            Data.submitted != null()).order_by(Data.id.desc()).first()
        assert data.submitted is not None
        assert data.submitted_by is not None
        # test data not available
        res = await client.put(
            app.url_path_for("data:unsubmit", id=1000),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 404
        # test data available
        res = await client.put(
            app.url_path_for("data:unsubmit", id=data.id),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res.get('submitted') is None
        assert res.get('submitted_by') is None
