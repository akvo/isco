import sys
import pytest
import json
from sqlalchemy.orm import Session
from seeder import util_roadmap
from httpx import AsyncClient
from fastapi import FastAPI
from tests.test_000_main import Acc


pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)
source_file = "./source/roadmap.json"
f = open(source_file)
try:
    data = json.load(f)
except FileNotFoundError:
    data = {}

form_def = {
    "id": 1669095326959,
    "name": "Roadmap",
    "description": data.get('description'),
    "languages": None,
    "version": 1.0,
    "question_group": [{
        "name": "Traceability",
        "description": None,
        "order": 1,
        "repeatable": True,
        "question": [{
            "id": 1669095326962,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 1,
            "translations": [{
                "name": "Commitment translated",
                "language": "de"
            }],
        }, {
            "id": 1669107420032,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1669107433881,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Milestones translated",
                "language": "de"
            }],
        }, {
            "id": 1669107484181,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Challenge translated",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{
            "language": "de",
            "name": "Traceability translated"
        }],
    }, {
        "name": "Certified and Independently Verified Cocoa",
        "description": None,
        "order": 2,
        "repeatable": True,
        "question": [{
            "id": 1669107562769,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "input",
            "order": 1,
            "translations": [{
                "name": "Commitment translated",
                "language": "de"
            }],
        }, {
            "id": 1674113183189,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1669107433881,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Milestones translated",
                "language": "de"
            }],
        }, {
            "id": 1674113210618,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Challenge translated",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{
            "language": "de",
            "name": "Certified and Independently Verified Cocoa translated",
        }],
    }, {
        "name": "Deforestation / Agroforestry",
        "description": None,
        "order": 3,
        "repeatable": True,
        "question": [{
            "id": 1669107635129,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "input",
            "order": 1,
            "translations": [{
                "name": "Commitment translated",
                "language": "de"
            }],
        }, {
            "id": 1674113380992,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1669107433881,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Milestones translated",
                "language": "de"
            }],
        }, {
            "id": 1674113384837,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Challenge translated",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{
            "language": "de",
            "name": "Deforestation / Agroforestry translated"
        }],
    }, {
        "name": "Child Labor",
        "description": None,
        "order": 4,
        "repeatable": True,
        "question": [{
            "id": 1674113993933,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "input",
            "order": 1,
            "translations": [{
                "name": "Commitment translated",
                "language": "de"
            }],
        }, {
            "id": 1674114001466,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1669107433881,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Milestones translated",
                "language": "de"
            }],
        }, {
            "id": 1674114011444,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Challenge translated",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{"language": "de", "name": "Child Labor translated"}],
    }],
    "tree": None,
    "initial_value": None,
    "organisation_ids": None,
}


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
        assert res == form_def
