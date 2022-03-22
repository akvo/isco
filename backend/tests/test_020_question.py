import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.question import QuestionType
from models.cascade import CascadeType
from models.skip_logic import OperatorType
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestQuestionRoutes():
    @pytest.mark.asyncio
    async def test_add_question(self, app: FastAPI, session: Session,
                                client: AsyncClient) -> None:
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
            "name": "Question 1",
            "translations": None,
            "mandatory": True,
            "datapoint_name": True,
            "variable_name": None,
            "type": QuestionType.text.value,
            "personal_data": False,
            "rule": None,
            "tooltip": "Question 1 tooltip",
            "tooltip_translations": None,
            "cascade": None,
            "repeating_objects": None,
            "order": None,
            "option": None,
            "member_access": None,
            "isco_access": None,
            "skip_logic": None,
        }
        res = await client.post(
            app.url_path_for("question:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "cascade": None,
            "datapoint_name": True,
            "form": 1,
            "isco_access": [],
            "mandatory": True,
            "member_access": [],
            "name": 'Question 1',
            "option": [],
            "order": 1,
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": 'Question 1 tooltip',
            "tooltip_translations": [],
            "translations": [],
            "type": 'text',
            "variable_name": None
        }

    @pytest.mark.asyncio
    async def test_update_question(self, app: FastAPI, session: Session,
                                   client: AsyncClient) -> None:
        # get question
        res = await client.get(
            app.url_path_for("question:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update question
        question_payload = {
            "form": 1,
            "question_group": 1,
            "name": "Question 1",
            "translations": [
                {"language": "id", "text": "Pertanyaan 1"}],
            "mandatory": True,
            "datapoint_name": True,
            "variable_name": None,
            "type": QuestionType.option.value,
            "personal_data": False,
            "rule": None,
            "tooltip": "Question 1 tooltip",
            "tooltip_translations": [
                {"language": "id", "text": "Keterangan Pertanyaan 1"}],
            "cascade": None,
            "repeating_objects": [
                {
                    "field": "unit",
                    "value": "cm",
                },
            ],
            "order": 1,
            "option": None,
            "member_access": None,
            "isco_access": None,
            "skip_logic": None,
        }
        res = await client.put(
            app.url_path_for("question:put", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": None,
            "datapoint_name": True,
            "form": 1,
            "id": 1,
            "isco_access": [],
            "mandatory": True,
            "member_access": [],
            "name": 'Question 1',
            "option": [],
            "order": 1,
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": [
                {
                    "field": "unit",
                    "value": "cm",
                },
            ],
            "rule": None,
            "skip_logic": [],
            "tooltip": 'Question 1 tooltip',
            "tooltip_translations": [
                {"language": "id", "text": "Keterangan Pertanyaan 1"}],
            "translations": [
                {"language": "id", "text": "Pertanyaan 1"}],
            "type": "option",
            "variable_name": None
        }

    @pytest.mark.asyncio
    async def test_add_option(self, app: FastAPI, session: Session,
                              client: AsyncClient) -> None:
        # get question
        res = await client.get(app.url_path_for("question:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # add option
        option_payload = {
            "code": None,
            "name": "Option 1",
            "translations": None,
            "question": 1,
            "order": None
        }
        res = await client.post(
            app.url_path_for("option:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=option_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "code": None,
            "id": 1,
            "name": "Option 1",
            "order": None,
            "question": 1,
            "translations": []
        }

    @pytest.mark.asyncio
    async def test_update_option(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        # get option
        res = await client.get(app.url_path_for("option:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update option
        option_payload = {
            "code": "opt1",
            "name": "Option 1",
            "translations": [
                {"language": "id", "text": "Pilihan 1"}],
            "question": 1,
            "order": 1,
        }
        res = await client.put(
            app.url_path_for("option:put", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json=option_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "code": "opt1",
            "id": 1,
            "name": "Option 1",
            "order": 1,
            "question": 1,
            "translations": [
                {"language": "id", "text": "Pilihan 1"}]
        }

    @pytest.mark.asyncio
    async def test_add_cascade(self, app: FastAPI, session: Session,
                               client: AsyncClient) -> None:
        # add cascade
        cascade_payload = {
            "name": "Cascade 1",
            "type": CascadeType.cascade.value,
            "cascades": [{
                "cascade": None,
                "parent": None,
                "code": None,
                "name": "Parent 1",
                "path": None,
                "level": 0
            }],
        }
        res = await client.post(
            app.url_path_for("cascade:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascades": [{
                "cascade": 3,
                "code": None,
                "id": 26,
                "level": 0,
                "name": "Parent 1",
                "parent": None,
                "path": None
            }],
            "id": 3,
            "name": "Cascade 1",
            "type": "cascade",
        }

    @pytest.mark.asyncio
    async def test_update_cascade(self, app: FastAPI, session: Session,
                                  client: AsyncClient) -> None:
        # get cascade
        res = await client.get(app.url_path_for("cascade:get_by_id", id=3))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 3
        # update cascade
        cascade_payload = {
            "name": "Cascade 1 Updated",
            "type": CascadeType.cascade.value,
            "cascades": None,
        }
        res = await client.put(
            app.url_path_for("cascade:put", id=3),
            headers={"Authorization": f"Bearer {account.token}"},
            json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 3,
            "name": "Cascade 1 Updated",
            "type": "cascade"
        }

    @pytest.mark.asyncio
    async def test_add_cascade_list(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        # get cascade
        res = await client.get(app.url_path_for("cascade:get_by_id", id=3))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 3
        # add cascade list
        cascade_payload = {
            "cascade": 3,
            "parent": None,
            "code": None,
            "name": "Parent 2",
            "path": None,
            "level": 0
        }
        res = await client.post(
            app.url_path_for("cascade_list:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": 3,
            "code": None,
            "id": 27,
            "level": 0,
            "name": "Parent 2",
            "parent": None,
            "path": None
        }

    @pytest.mark.asyncio
    async def test_update_cascade_list(self, app: FastAPI, session: Session,
                                       client: AsyncClient) -> None:
        # get cascade list
        res = await client.get(
            app.url_path_for("cascade_list:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # add cascade list
        cascade_payload = {
            "cascade": 1,
            "parent": None,
            "code": "P1",
            "name": "Parent 1 Updated",
            "path": None,
            "level": 0
        }
        res = await client.put(
            app.url_path_for("cascade_list:put", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
            json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": 1,
            "code": "P1",
            "id": 1,
            "level": 0,
            "name": "Parent 1 Updated",
            "parent": None,
            "path": None
        }

    @pytest.mark.asyncio
    async def test_add_skip_logic(self, app: FastAPI, session: Session,
                                  client: AsyncClient) -> None:
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
            "order": None,
            "option": None,
            "member_access": None,
            "isco_access": None,
            "skip_logic": None,
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
            "variable_name": None
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

    @pytest.mark.asyncio
    async def test_add_question_with_option_and_access(self,
                                                       app: FastAPI,
                                                       session: Session,
                                                       client: AsyncClient
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
            "order": None,
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
            "variable_name": None
        }

    @pytest.mark.asyncio
    async def test_update_question_with_access(self,
                                               app: FastAPI,
                                               session: Session,
                                               client: AsyncClient
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
            "skip_logic": []
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
            "variable_name": None
        }

    @pytest.mark.asyncio
    async def test_add_question_group_with_question(self,
                                                    app: FastAPI,
                                                    session: Session,
                                                    client: AsyncClient
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
            "order": None,
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
                    "order": None,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None
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
                    "variable_name": None
                }
            ],
            "translations": [],
        }
