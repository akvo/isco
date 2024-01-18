import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


# test to update question cascade source after a submission
class TestUpdateQuestionCascade:
    @pytest.mark.asyncio
    async def test_update_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get question
        res = await client.get(app.url_path_for("question:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update question
        question_payload = {
            "cascade": 3,
            "datapoint_name": False,
            "form": 1,
            "isco_access": [1],
            "mandatory": False,
            "member_access": [1],
            "name": "Cascade",
            "option": [],
            "order": 3,
            "personal_data": False,
            "question_group": 2,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": None,
            "tooltip_translations": [],
            "translations": [],
            "type": "cascade",
            "variable_name": None,
            "core_mandatory": False,
            "deactivate": False,
            "disableDelete": False,
            "autofield": None,
        }
        res = await client.put(
            app.url_path_for("question:put", id=6),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload,
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": 3,
            "datapoint_name": False,
            "form": 1,
            "id": 6,
            "isco_access": [1],
            "mandatory": False,
            "member_access": [1],
            "name": "Cascade",
            "option": [],
            "order": 3,
            "personal_data": False,
            "question_group": 2,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": None,
            "tooltip_translations": [],
            "translations": [],
            "type": "cascade",
            "variable_name": None,
            "core_mandatory": False,
            "deactivate": False,
            "disableDelete": False,
            "autofield": None,
        }
