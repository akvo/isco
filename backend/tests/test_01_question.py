import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.question import QuestionType
from models.cascade import CascadeType
from models.skip_logic import OperatorType

pytestmark = pytest.mark.asyncio
sys.path.append("..")


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
        }
        res = await client.post(
            app.url_path_for("question:create"), json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "cascade": None,
            "datapoint_name": True,
            "form": 1,
            "mandatory": True,
            "name": 'Question 1',
            "options": [],
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": None,
            "rule": None,
            "skip_logic": [],
            "tooltip": 'Question 1 tooltip',
            "tooltip_translations": None,
            "translations": None,
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
            "type": QuestionType.single_select.value,
            "personal_data": False,
            "rule": None,
            "tooltip": "Question 1 tooltip",
            "tooltip_translations": [
                {"language": "id", "text": "Keterangan Pertanyaan 1"}],
            "cascade": None,
            "repeating_objects": None,
        }
        res = await client.put(
            app.url_path_for("question:put", id=1), json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "cascade": None,
            "datapoint_name": True,
            "form": 1,
            "mandatory": True,
            "name": 'Question 1',
            "options": [],
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": None,
            "rule": None,
            "skip_logic": [],
            "tooltip": 'Question 1 tooltip',
            "tooltip_translations": [
                {"language": "id", "text": "Keterangan Pertanyaan 1"}],
            "translations": [
                {"language": "id", "text": "Pertanyaan 1"}],
            "type": 'single_select',
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
            "question": 1
        }
        res = await client.post(
            app.url_path_for("option:create"), json=option_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "code": None,
            "id": 1,
            "name": "Option 1",
            "translations": None
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
            "question": 1
        }
        res = await client.put(
            app.url_path_for("option:put", id=1), json=option_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "code": "opt1",
            "id": 1,
            "name": "Option 1",
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
            "cascade_list": [{
                "cascade": None,
                "parent": None,
                "code": None,
                "name": "Cascade List Parent 1",
                "path": None,
                "level": 0
            }]
        }
        res = await client.post(
            app.url_path_for("cascade:create"), json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "name": "Cascade 1",
            "type": "cascade",
            "cascade_list": [{
                "cascade": 1,
                "code": None,
                "id": 1,
                "level": 0,
                "name": "Cascade List Parent 1",
                "parent": None,
                "path": None
            }]
        }

    @pytest.mark.asyncio
    async def test_update_cascade(self, app: FastAPI, session: Session,
                                  client: AsyncClient) -> None:
        # get cascade
        res = await client.get(app.url_path_for("cascade:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update cascade
        cascade_payload = {
            "name": "Cascade 1 Updated",
            "type": CascadeType.cascade.value,
            "cascade_list": None
        }
        res = await client.put(app.url_path_for("cascade:put", id=1),
                               json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 1,
            "name": "Cascade 1 Updated",
            "type": "cascade"
        }

    @pytest.mark.asyncio
    async def test_add_cascade_list(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        # get cascade
        res = await client.get(app.url_path_for("cascade:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # get cascade list
        res = await client.get(
            app.url_path_for("cascade_list:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # add cascade list
        cascade_payload = {
            "cascade": 1,
            "parent": 1,
            "code": None,
            "name": "Child of Parent 1",
            "path": "1.",
            "level": 1
        }
        res = await client.post(
            app.url_path_for("cascade_list:create"), json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": 1,
            "code": None,
            "id": 2,
            "level": 1,
            "name": "Child of Parent 1",
            "parent": 1,
            "path": "1."
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
            "name": "Cascade List Parent 1 Updated",
            "path": None,
            "level": 0
        }
        res = await client.put(app.url_path_for("cascade_list:put", id=1),
                               json=cascade_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": 1,
            "code": "P1",
            "id": 1,
            "level": 0,
            "name": "Cascade List Parent 1 Updated",
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
        }
        res = await client.post(
            app.url_path_for("question:create"), json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 2,
            "cascade": None,
            "datapoint_name": True,
            "form": 1,
            "mandatory": True,
            "name": 'Question 2',
            "options": [],
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": None,
            "rule": None,
            "skip_logic": [],
            "tooltip": 'Question 2 tooltip',
            "tooltip_translations": None,
            "translations": None,
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
            "value": "Option 1",
            "type": QuestionType.single_select.value
        }
        res = await client.post(
            app.url_path_for("skip_logic:create"), json=skip_logic_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "dependent_to": 1,
            "id": 1,
            "operator": "equal",
            "question": 2,
            "type": "single_select",
            "value": "Option 1",
        }
