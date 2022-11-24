import sys
import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from httpx import AsyncClient
from fastapi import FastAPI
from tests.test_000_main import Acc


pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)
today = datetime.now().strftime("%B %d, %Y")


class TestManageRoadmapDatapoint():
    @pytest.mark.asyncio
    async def test_post_roadmap_datapoint(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        payload = {
            "organisation_id": 1,
            "answers": {
                "1669095326962": "This is first commitment",
                "1669107420032": [{
                    "milestone": "First Milestone"
                }],
                "1669095326962-1": "This is second commitment",
                "1669107420032-1": [{
                    "milestone": "Milestone 1"
                }, {
                    "milestone": "Milestone 2"
                }],
                "1669107562769": "Example answer 1",
                "1669107635129": "Example answer 2",
            }
        }
        # post roadmap datapoint
        res = await client.post(
            app.url_path_for("roadmap:post_datapoint"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=payload
        )
        assert res.status_code == 204

    @pytest.mark.asyncio
    async def test_get_roadmap_datapoints(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get roadmap datapoints
        res = await client.get(
            app.url_path_for("roadmap:get_datapoints"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "current": 1,
            "data": [{
                "id": 1,
                "datapoint_name": "All | staff Akvo",
                "organisation": "staff Akvo",
                "organisation_id": 1,
                "submitted_date": today
            }],
            "total": 1,
            "total_page": 1
        }
