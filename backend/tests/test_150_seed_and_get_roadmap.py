import sys
import pytest
from sqlalchemy.orm import Session
from seeder import util_roadmap
from httpx import AsyncClient
from fastapi import FastAPI
from tests.test_000_main import Acc


pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestSeedAndGetRoadmapWebform():
    @pytest.mark.asyncio
    async def test_roadmap_seeder_and_get_roadmap_webform(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        seed_roadmap = util_roadmap.roadmap_form_seeder(session=session)
        assert seed_roadmap is True
        # get roadmap webform
        res = await client.get(
            app.url_path_for("roadmap:get_webform"),
            headers={"Authorization": f"Bearer {account.token}"}
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
                    "description": "Lorem Ipsum Dolor sit Amet",
                    "order": 1,
                    "repeatable": True,
                    "repeatText": "Add another Commitment",
                    "repeatButtonPlacement": "bottom",
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
                            "tooltip": {"text": "Lorem Ipsum Dolor sit Amet"},
                            "columns": [{
                                "id": 1669107433881,
                                "label": "Milestone",
                                "name": "milestone",
                                "type": "input"
                            }]
                        },
                        {
                            "id": 1669107484181,
                            "name": "Challenges",
                            "required": False,
                            "meta": False,
                            "type": "text",
                            "order": 3,
                        },
                    ],
                },
                {
                    "name": "Certified and Independently Verified Cocoa",
                    "description": None,
                    "order": 2,
                    "repeatable": False,
                    "question": [
                        {
                            "id": 1669107562769,
                            "name": "Example Question 1",
                            "required": False,
                            "meta": False,
                            "type": "input",
                            "order": 1,
                        }
                    ],
                },
                {
                    "name": "Deforestation / Agroforestry",
                    "description": None,
                    "order": 3,
                    "repeatable": False,
                    "question": [
                        {
                            "id": 1669107635129,
                            "name": "Example Question 2",
                            "required": False,
                            "meta": False,
                            "type": "input",
                            "order": 1,
                        }
                    ],
                },
            ],
            "tree": None,
            "initial_value": None
        }
