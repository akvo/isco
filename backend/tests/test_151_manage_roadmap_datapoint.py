import sys
import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from httpx import AsyncClient
from fastapi import FastAPI
from tests.test_000_main import Acc
from db.crud_roadmap import get_answer_by_data


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
            "answers": {
                "1669095326962": "Updated first commitment",
                "1669107420032": [{
                    "milestone": "Updated First Milestone"
                }],
                "1669095326962-1": "Updated second commitment",
                "1669107420032-1": [{
                    "milestone": "Update Milestone 1"
                }],
                "1669095326962-2": "Third commitment",
                "1669107420032-2": [{
                    "milestone": "Milestone 1"
                }],
                "1669107562769": "Example answer 1",
                "1669107635129": "Example answer 2",
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
                "question": 1669095326962,
                "type": "text",
                "repeat_index": 0,
                "value": "Updated first commitment",
            },
            {
                "id": 2,
                "question": 1669107420032,
                "type": "table",
                "repeat_index": 0,
                "value": [{"milestone": "Updated First Milestone"}],
            },
            {
                "id": 3,
                "question": 1669095326962,
                "type": "text",
                "repeat_index": 1,
                "value": "Updated second commitment",
            },
            {
                "id": 4,
                "question": 1669107420032,
                "type": "table",
                "repeat_index": 1,
                "value": [{"milestone": "Update Milestone 1"}],
            },
            {
                "id": 7,
                "question": 1669095326962,
                "type": "text",
                "repeat_index": 2,
                "value": "Third commitment",
            },
            {
                "id": 8,
                "question": 1669107420032,
                "type": "table",
                "repeat_index": 2,
                "value": [{"milestone": "Milestone 1"}],
            },
            {
                "id": 5,
                "question": 1669107562769,
                "type": "input",
                "repeat_index": 0,
                "value": "Example answer 1",
            },
            {
                "id": 6,
                "question": 1669107635129,
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
        assert res == {
            "id": 1669095326959,
            "name": "Roadmap",
            "description": "Lorem Ipsum Dolor sit Amet",
            "languages": None,
            "version": 1.0,
            "question_group": [
                {
                    "name": "Traceability",
                    "description": None,
                    "order": 1,
                    "repeatable": True,
                    "question": [
                        {
                            "id": 1669095326962,
                            "name": "Commitment",
                            "required": False,
                            "meta": False,
                            "type": "text",
                            "order": 1,
                        },
                        {
                            "id": 1669107420032,
                            "name": "Milestones",
                            "required": False,
                            "meta": False,
                            "type": "table",
                            "order": 2,
                            "columns": [
                                {
                                    "id": 1669107433881,
                                    "name": "milestone",
                                    "type": "input",
                                    "label": "Milestone",
                                }
                            ],
                        },
                        {
                            "id": 1669107484181,
                            "name": "Challenge",
                            "required": False,
                            "meta": False,
                            "type": "text",
                            "order": 3,
                        },
                    ],
                    "repeatButtonPlacement": "bottom",
                    "repeatText": "Add another Commitment",
                },
                {
                    "name": "Certified and Independently Verified Cocoa",
                    "description": None,
                    "order": 2,
                    "repeatable": True,
                    "question": [
                        {
                            "id": 1669107562769,
                            "name": "Commitment",
                            "required": False,
                            "meta": False,
                            "type": "input",
                            "order": 1,
                        },
                        {
                            "id": 1674113183189,
                            "name": "Milestones",
                            "required": False,
                            "meta": False,
                            "type": "table",
                            "order": 2,
                            "columns": [
                                {
                                    "id": 1669107433881,
                                    "name": "milestone",
                                    "type": "input",
                                    "label": "Milestone",
                                }
                            ],
                        },
                        {
                            "id": 1674113210618,
                            "name": "Challenge",
                            "required": False,
                            "meta": False,
                            "type": "text",
                            "order": 3,
                        },
                    ],
                    "repeatButtonPlacement": "bottom",
                    "repeatText": "Add another Commitment",
                },
                {
                    "name": "Deforestation / Agroforestry",
                    "description": None,
                    "order": 3,
                    "repeatable": True,
                    "question": [
                        {
                            "id": 1669107635129,
                            "name": "Commitment",
                            "required": False,
                            "meta": False,
                            "type": "input",
                            "order": 1,
                        },
                        {
                            "id": 1674113380992,
                            "name": "Milestones",
                            "required": False,
                            "meta": False,
                            "type": "table",
                            "order": 2,
                            "columns": [
                                {
                                    "id": 1669107433881,
                                    "name": "milestone",
                                    "type": "input",
                                    "label": "Milestone",
                                }
                            ],
                        },
                        {
                            "id": 1674113384837,
                            "name": "Challenge",
                            "required": False,
                            "meta": False,
                            "type": "text",
                            "order": 3,
                        },
                    ],
                    "repeatButtonPlacement": "bottom",
                    "repeatText": "Add another Commitment",
                },
                {
                    "name": "Child Labor",
                    "description": None,
                    "order": 4,
                    "repeatable": True,
                    "question": [
                        {
                            "id": 1674113993933,
                            "name": "Commitment",
                            "required": False,
                            "meta": False,
                            "type": "input",
                            "order": 1,
                        },
                        {
                            "id": 1674114001466,
                            "name": "Milestones",
                            "required": False,
                            "meta": False,
                            "type": "table",
                            "order": 2,
                            "columns": [
                                {
                                    "id": 1669107433881,
                                    "name": "milestone",
                                    "type": "input",
                                    "label": "Milestone",
                                }
                            ],
                        },
                        {
                            "id": 1674114011444,
                            "name": "Challenge",
                            "required": False,
                            "meta": False,
                            "type": "text",
                            "order": 3,
                        },
                    ],
                    "repeatButtonPlacement": "bottom",
                    "repeatText": "Add another Commitment",
                },
            ],
            "tree": None,
            "initial_value": [
                {
                    "question": 1669095326962,
                    "value": "Updated first commitment"
                },
                {
                    "question": 1669107420032,
                    "value": [{"milestone": "Updated First Milestone"}],
                },
                {
                    "question": 1669095326962,
                    "repeatIndex": 1,
                    "value": "Updated second commitment",
                },
                {
                    "question": 1669107420032,
                    "repeatIndex": 1,
                    "value": [{"milestone": "Update Milestone 1"}],
                },
                {
                    "question": 1669095326962,
                    "repeatIndex": 2,
                    "value": "Third commitment"
                },
                {
                    "question": 1669107420032,
                    "repeatIndex": 2,
                    "value": [{"milestone": "Milestone 1"}],
                },
                {
                    "question": 1669107562769,
                    "value": "Example answer 1"
                },
                {
                    "question": 1669107635129,
                    "value": "Example answer 2"
                },
            ],
            "organisation_ids": [1],
        }

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
