import sys
import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from httpx import AsyncClient
from fastapi import FastAPI
from tests.test_000_main import Acc
from db.crud_roadmap import get_answer_by_data
from tests.test_150_seed_and_get_roadmap import form_def


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
            "language": "en",
            "answers": {
                "1681318760850": "This is first commitment",
                "1681319078754": [{
                    "milestone": "First Milestone"
                }],
                "1681318760850-1": "This is second commitment",
                "1681319078754-1": [{
                    "milestone": "Milestone 1"
                }, {
                    "milestone": "Milestone 2"
                }],
                "1681318935840": "Example answer 1",
                "1681318949956": "Example answer 2",
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
                "language": "en",
                "organisation": "staff Akvo",
                "organisation_id": 1,
                "submitted_date": today
            }],
            "total": 1,
            "total_page": 1
        }
        # get roadmap datapoints filter by member 1
        res = await client.get(
            app.url_path_for("roadmap:get_datapoints"),
            params={"member_type": 1},
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
                "language": "en",
                "organisation_id": 1,
                "submitted_date": today
            }],
            "total": 1,
            "total_page": 1
        }
        # get roadmap datapoints filter by member 1
        res = await client.get(
            app.url_path_for("roadmap:get_datapoints"),
            params={"member_type": 2},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_put_roadmap_datapoint(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        payload = {
            "organisation_id": 1,
            "language": "en",
            "answers": {
                "1681318760850": "Updated first commitment",
                "1681319078754": [{
                    "milestone": "Updated First Milestone"
                }],
                "1681318760850-1": "Updated second commitment",
                "1681319078754-1": [{
                    "milestone": "Update Milestone 1"
                }],
                "1681318760850-2": "Third commitment",
                "1681319078754-2": [{
                    "milestone": "Milestone 1"
                }],
                "1681318935840": "Example answer 1",
                "1681318949956": "Example answer 2",
            }
        }
        # post roadmap datapoint
        res = await client.put(
            app.url_path_for("roadmap:update_datapoint", data_id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json=payload
        )
        assert res.status_code == 204
        answers = get_answer_by_data(session=session, data_id=1)
        answers = [a.formatted for a in answers]
        assert answers == [
            {
                "id": 1,
                "question": 1681318760850,
                "type": "text",
                "repeat_index": 0,
                "value": "Updated first commitment",
            },
            {
                "id": 2,
                "question": 1681319078754,
                "type": "table",
                "repeat_index": 0,
                "value": [{"milestone": "Updated First Milestone"}],
            },
            {
                "id": 3,
                "question": 1681318760850,
                "type": "text",
                "repeat_index": 1,
                "value": "Updated second commitment",
            },
            {
                "id": 4,
                "question": 1681319078754,
                "type": "table",
                "repeat_index": 1,
                "value": [{"milestone": "Update Milestone 1"}],
            },
            {
                "id": 7,
                "question": 1681318760850,
                "type": "text",
                "repeat_index": 2,
                "value": "Third commitment",
            },
            {
                "id": 8,
                "question": 1681319078754,
                "type": "table",
                "repeat_index": 2,
                "value": [{"milestone": "Milestone 1"}],
            },
            {
                "id": 5,
                "question": 1681318935840,
                "type": "input",
                "repeat_index": 0,
                "value": "Example answer 1",
            },
            {
                "id": 6,
                "question": 1681318949956,
                "type": "input",
                "repeat_index": 0,
                "value": "Example answer 2",
            },
        ]

    @pytest.mark.asyncio
    async def test_get_roadmap_webform_with_initial_value(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get roadmap webform
        res = await client.get(
            app.url_path_for("roadmap:get_webform"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={'data_id': 1}
        )
        assert res.status_code == 200
        res = res.json()
        form_def.update({
            "initial_value": [
                {
                    "question": 1681318760850,
                    "value": "Updated first commitment"
                },
                {
                    "question": 1681319078754,
                    "value": [{"milestone": "Updated First Milestone"}],
                },
                {
                    "question": 1681318760850,
                    "repeatIndex": 1,
                    "value": "Updated second commitment",
                },
                {
                    "question": 1681319078754,
                    "repeatIndex": 1,
                    "value": [{"milestone": "Update Milestone 1"}],
                },
                {
                    "question": 1681318760850,
                    "repeatIndex": 2,
                    "value": "Third commitment"
                },
                {
                    "question": 1681319078754,
                    "repeatIndex": 2,
                    "value": [{"milestone": "Milestone 1"}],
                },
                {
                    "question": 1681318935840,
                    "value": "Example answer 1"
                },
                {
                    "question": 1681318949956,
                    "value": "Example answer 2"
                },
            ],
            "organisation_ids": [1],
        })
        assert res == form_def
