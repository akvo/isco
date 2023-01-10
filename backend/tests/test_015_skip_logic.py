import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.question import QuestionType
from models.skip_logic import OperatorType
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestSkipLogicRoutes():
    @pytest.mark.asyncio
    async def test_add_skip_logic(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # add question type text
        question_payload = {
            "form": 1,
            "question_group": 1,
            "name": "Question 2",
            "translations": None,
            "mandatory": True,
            "datapoint_name": True,
            "variable_name": None,
            "type": QuestionType.text.value,
            "personal_data": False,
            "rule": None,
            "tooltip": "Question 2 tooltip",
            "tooltip_translations": None,
            "cascade": None,
            "repeating_objects": None,
            "order": 2,
            "option": None,
            "member_access": None,
            "isco_access": None,
            "skip_logic": None,
            "core_mandatory": False,
        }
        res = await client.post(
            app.url_path_for("question:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 2,
            "cascade": None,
            "datapoint_name": True,
            "form": 1,
            "isco_access": [],
            "mandatory": True,
            "member_access": [],
            "name": 'Question 2',
            "order": 2,
            "option": [],
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": 'Question 2 tooltip',
            "tooltip_translations": [],
            "translations": [],
            "type": 'text',
            "variable_name": None,
            "core_mandatory": False,
        }
        # get question
        res = await client.get(app.url_path_for("question:get_by_id", id=2))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 2
        # add skip logic
        skip_logic_payload = {
            "question": 2,
            "dependent_to": 1,
            "operator": OperatorType.equal.value,
            "value": "1",
            "type": QuestionType.option.value
        }
        res = await client.post(
            app.url_path_for("skip_logic:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=skip_logic_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "dependent_to": 1,
            "id": 1,
            "operator": "equal",
            "question": 2,
            "type": "option",
            "value": "1",
        }
