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


class TestAdvancedQuestionGroupAndQuestionRoutes():
    @pytest.mark.asyncio
    async def test_add_question_with_option_and_access(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # get question group
        res = await client.get(
            app.url_path_for("question_group:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        question_payload = {
            "form": 1,
            "question_group": 1,
            "name": "Gender",
            "translations": None,
            "mandatory": True,
            "datapoint_name": False,
            "variable_name": None,
            "type": QuestionType.option.value,
            "personal_data": False,
            "rule": None,
            "tooltip": None,
            "tooltip_translations": None,
            "cascade": None,
            "repeating_objects": None,
            "order": 3,
            "core_mandatory": True,
            "option": [
                {
                    "code": None,
                    "name": "Male",
                    "question": None,
                    "order": 1,
                    "translations": None
                },
                {
                    "code": None,
                    "name": "Female",
                    "question": None,
                    "order": 2,
                    "translations": None
                }
            ],
            "member_access": [1, 2],
            "isco_access": [1],
            "skip_logic": [
                {
                    "question": None,
                    "dependent_to": 1,
                    "operator": OperatorType.equal.value,
                    "value": "1",
                    "type": QuestionType.option.value
                }
            ]
        }
        res = await client.post(
            app.url_path_for("question:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": None,
            "datapoint_name": False,
            "form": 1,
            "id": 3,
            "isco_access": [1],
            "mandatory": True,
            "member_access": [1, 2],
            "name": 'Gender',
            "option": [
                {
                    "code": None,
                    "id": 2,
                    "name": "Male",
                    "order": 1,
                    "question": 3,
                    "translations": []
                },
                {
                    "code": None,
                    "id": 3,
                    "name": "Female",
                    "order": 2,
                    "question": 3,
                    "translations": []
                }
            ],
            "order": 3,
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [
                {
                    "dependent_to": 1,
                    "id": 2,
                    "operator": "equal",
                    "question": 3,
                    "type": "option",
                    "value": "1"
                }
            ],
            "tooltip": None,
            "tooltip_translations": [],
            "translations": [],
            "type": "option",
            "variable_name": None,
            "core_mandatory": True,
        }

    @pytest.mark.asyncio
    async def test_update_question_with_access(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # get question group
        res = await client.get(
            app.url_path_for("question_group:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # add question type text
        question_payload = {
            "form": 1,
            "question_group": 1,
            "name": "Gender",
            "translations": None,
            "mandatory": True,
            "datapoint_name": False,
            "variable_name": None,
            "type": QuestionType.option.value,
            "personal_data": False,
            "rule": None,
            "tooltip": None,
            "tooltip_translations": None,
            "cascade": None,
            "repeating_objects": None,
            "order": 3,
            "option": [],
            "member_access": [2],
            "isco_access": [2],
            "skip_logic": [],
            "core_mandatory": True,
        }
        res = await client.put(
            app.url_path_for("question:put", id=3),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": None,
            "datapoint_name": False,
            "form": 1,
            "id": 3,
            "isco_access": [2],
            "mandatory": True,
            "member_access": [2],
            "name": 'Gender',
            "option": [
                {
                    "code": None,
                    "id": 2,
                    "name": "Male",
                    "order": 1,
                    "question": 3,
                    "translations": []
                },
                {
                    "code": None,
                    "id": 3,
                    "name": "Female",
                    "order": 2,
                    "question": 3,
                    "translations": []
                }
            ],
            "order": 3,
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [
                {
                    "dependent_to": 1,
                    "id": 2,
                    "operator": "equal",
                    "question": 3,
                    "type": "option",
                    "value": "1"
                }
            ],
            "tooltip": None,
            "tooltip_translations": [],
            "translations": [],
            "type": "option",
            "variable_name": None,
            "core_mandatory": True,
        }

    @pytest.mark.asyncio
    async def test_add_question_group_with_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # create question group with question
        question_group_payload = {
            "form": 1,
            "name": "Question Group 2",
            "description": "This is description",
            "translations": None,
            "repeat": False,
            "repeat_text": None,
            "order": 2,
            "member_access": [1],
            "isco_access": [1],
            "question": [
                {
                    "form": None,
                    "question_group": None,
                    "name": "Age",
                    "translations": None,
                    "mandatory": True,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": QuestionType.number.value,
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": None,
                    "cascade": None,
                    "repeating_objects": None,
                    "order": 1,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": True,
                },
                {
                    "form": None,
                    "question_group": None,
                    "name": "Weight",
                    "translations": None,
                    "mandatory": True,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": QuestionType.number.value,
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": None,
                    "cascade": None,
                    "repeating_objects": [{
                        "field": "unit",
                        "value": "kilograms",
                    }],
                    "order": 2,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": False,
                },
                {
                    "form": None,
                    "question_group": None,
                    "name": "Cascade",
                    "translations": None,
                    "mandatory": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": QuestionType.cascade.value,
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": None,
                    "cascade": 1,
                    "repeating_objects": [],
                    "order": 3,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": False,
                },
                {
                    "form": None,
                    "question_group": None,
                    "name": "Nested List",
                    "translations": None,
                    "mandatory": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": QuestionType.nested_list.value,
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": None,
                    "cascade": 2,
                    "repeating_objects": [],
                    "order": 4,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": False,
                },
                {
                    "form": None,
                    "question_group": None,
                    "name": "Date",
                    "translations": None,
                    "mandatory": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": QuestionType.date.value,
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": None,
                    "cascade": None,
                    "repeating_objects": [],
                    "order": 5,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": False,
                },
                {
                    "form": None,
                    "question_group": None,
                    "name": "Multiple Option",
                    "translations": None,
                    "mandatory": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": QuestionType.multiple_option.value,
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": None,
                    "cascade": None,
                    "repeating_objects": [],
                    "order": 6,
                    "option": [
                        {
                            "code": None,
                            "name": "MO-1",
                            "question": None,
                            "order": 1,
                            "translations": None
                        },
                        {
                            "code": None,
                            "name": "MO-2",
                            "question": None,
                            "order": 2,
                            "translations": None
                        }
                    ],
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": False,
                }
            ]
        }
        res = await client.post(
            app.url_path_for("question_group:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_group_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "description": "This is description",
            "form": 1,
            "id": 2,
            "isco_access": [1],
            "member_access": [1],
            "name": "Question Group 2",
            "order": 2,
            "repeat": False,
            "repeat_text": None,
            "translations": [],
            "question": [
                {
                    "cascade": None,
                    "datapoint_name": False,
                    "form": 1,
                    "id": 4,
                    "isco_access": [1],
                    "mandatory": True,
                    "member_access": [1],
                    "name": 'Age',
                    "option": [],
                    "order": 1,
                    "personal_data": False,
                    "question_group": 2,
                    "repeating_objects": [],
                    "rule": None,
                    "skip_logic": [],
                    "tooltip": None,
                    "tooltip_translations": [],
                    "translations": [],
                    "type": "number",
                    "variable_name": None,
                    "core_mandatory": True,
                },
                {
                    "cascade": None,
                    "datapoint_name": False,
                    "form": 1,
                    "id": 5,
                    "isco_access": [1],
                    "mandatory": True,
                    "member_access": [1],
                    "name": 'Weight',
                    "option": [],
                    "order": 2,
                    "personal_data": False,
                    "question_group": 2,
                    "repeating_objects": [{
                        "field": "unit",
                        "value": "kilograms",
                    }],
                    "rule": None,
                    "skip_logic": [],
                    "tooltip": None,
                    "tooltip_translations": [],
                    "translations": [],
                    "type": "number",
                    "variable_name": None,
                    "core_mandatory": False,
                },
                {
                    "cascade": 1,
                    "datapoint_name": False,
                    "form": 1,
                    "id": 6,
                    "isco_access": [1],
                    "mandatory": False,
                    "member_access": [1],
                    "name": 'Cascade',
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
                },
                {
                    "cascade": 2,
                    "datapoint_name": False,
                    "form": 1,
                    "id": 7,
                    "isco_access": [1],
                    "mandatory": False,
                    "member_access": [1],
                    "name": 'Nested List',
                    "option": [],
                    "order": 4,
                    "personal_data": False,
                    "question_group": 2,
                    "repeating_objects": [],
                    "rule": None,
                    "skip_logic": [],
                    "tooltip": None,
                    "tooltip_translations": [],
                    "translations": [],
                    "type": "nested_list",
                    "variable_name": None,
                    "core_mandatory": False,
                },
                {
                    "cascade": None,
                    "datapoint_name": False,
                    "form": 1,
                    "id": 8,
                    "isco_access": [1],
                    "mandatory": False,
                    "member_access": [1],
                    "name": 'Date',
                    "option": [],
                    "order": 5,
                    "personal_data": False,
                    "question_group": 2,
                    "repeating_objects": [],
                    "rule": None,
                    "skip_logic": [],
                    "tooltip": None,
                    "tooltip_translations": [],
                    "translations": [],
                    "type": "date",
                    "variable_name": None,
                    "core_mandatory": False,
                },
                {
                    "cascade": None,
                    "datapoint_name": False,
                    "form": 1,
                    "id": 9,
                    "isco_access": [1],
                    "mandatory": False,
                    "member_access": [1],
                    "name": 'Multiple Option',
                    "option": [{
                        'code': None,
                        'id': 4,
                        'name': 'MO-1',
                        'order': 1,
                        'question': 9,
                        'translations': []
                    }, {
                        'code': None,
                        'id': 5,
                        'name': 'MO-2',
                        'order': 2,
                        'question': 9,
                        'translations': []
                    }],
                    "order": 6,
                    "personal_data": False,
                    "question_group": 2,
                    "repeating_objects": [],
                    "rule": None,
                    "skip_logic": [],
                    "tooltip": None,
                    "tooltip_translations": [],
                    "translations": [],
                    "type": "multiple_option",
                    "variable_name": None,
                    "core_mandatory": False,
                },
            ],
        }
