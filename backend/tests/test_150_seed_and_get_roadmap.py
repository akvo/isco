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
    "id": 1681318760848,
    "name": "Roadmap",
    "description": data.get('description'),
    "languages": None,
    'language': 'en',
    "version": 1.0,
    "question_group": [{
        "name": "Member’s comment",
        'description': None,
        "order": 1,
        "repeatable": False,
        "question": [{
            "id": 1681318760851,
            "name": "Member’s comment on the roadmap",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 1,
            "translations": [{
                "name": "Kommentar des Mitglieds zur Roadmap",
                "language": "de"
            }],
        }],
        "translations": [{
            "language": "de",
            "name": "Kommentar des Mitglieds"
        }],
    }, {
        "name": "Traceability",
        "description": None,
        "order": 2,
        "repeatable": True,
        "question": [{
            "id": 1681318760850,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 1,
            "translations": [{
                "name": "Commitment",
                "language": "de"
            }],
        }, {
            "id": 1681319078754,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1681319088057,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Meilenstein",
                "language": "de"
            }],
        }, {
            "id": 1681319133130,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Herausforderung",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{
            "language": "de",
            "name": "Rückverfolgbarkeit"
        }],
    }, {
        "name": "Certified and Independently Verified Cocoa",
        "description": None,
        "order": 3,
        "repeatable": True,
        "question": [{
            "id": 1681318935840,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "input",
            "order": 1,
            "translations": [{
                "name": "Commitment",
                "language": "de"
            }],
        }, {
            "id": 1681319280488,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1681319290820,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Meilenstein",
                "language": "de"
            }],
        }, {
            "id": 1681319304882,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Herausforderung",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{
            "language": "de",
            "name": "Zertifizierter und unabhängig verifizierter Kakao",
        }],
    }, {
        "name": "Deforestation / Agroforestry",
        "description": None,
        "order": 4,
        "repeatable": True,
        "question": [{
            "id": 1681318949956,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "input",
            "order": 1,
            "translations": [{
                "name": "Commitment",
                "language": "de"
            }],
        }, {
            "id": 1681319348752,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1681319359989,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Meilenstein",
                "language": "de"
            }],
        }, {
            "id": 1681319348753,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Herausforderung",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{
            "language": "de",
            "name": "Entwaldung/Agroforstwirtschaft"
        }],
    }, {
        "name": "Child Labor",
        "description": None,
        "order": 5,
        "repeatable": True,
        "question": [{
            "id": 1681318962432,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "input",
            "order": 1,
            "translations": [{
                "name": "Commitment",
                "language": "de"
            }],
        }, {
            "id": 1681319382431,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1681319390959,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Meilenstein",
                "language": "de"
            }],
        }, {
            "id": 1681319410548,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Herausforderung",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{"language": "de", "name": "Kinderarbeit"}],
    }, {
        "name": "Living Income",
        "description": None,
        "order": 6,
        "repeatable": True,
        "question": [{
            "id": 1681318972282,
            "name": "Commitment",
            "required": False,
            "meta": False,
            "type": "input",
            "order": 1,
            "translations": [{
                "name": "Commitment",
                "language": "de"
            }],
        }, {
            "id": 1681319430446,
            "name": "Milestones",
            "required": False,
            "meta": False,
            "type": "table",
            "order": 2,
            "columns": [{
                "id": 1681319440394,
                "name": "milestone",
                "type": "input",
                "label": "Milestone",
            }],
            "translations": [{
                "name": "Meilenstein",
                "language": "de"
            }],
        }, {
            "id": 1681319446621,
            "name": "Challenge",
            "required": False,
            "meta": False,
            "type": "text",
            "order": 3,
            "translations": [{
                "name": "Herausforderung",
                "language": "de"
            }],
        }],
        "repeatButtonPlacement": "bottom",
        "repeatText": "Add another Commitment",
        "translations": [{
            "language": "de",
            "name": "Existenzsichernde Einkommen",
        }],
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
