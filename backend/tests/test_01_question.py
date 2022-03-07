import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.question import QuestionType, MemberType, IscoType

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
            "member_type": [MemberType.retail.value, MemberType.disco.value],
            "isco_type": [IscoType.isco.value],
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
            "isco_type": ['ISCO'],
            "mandatory": True,
            "member_type": ['Retail', 'DISCO - Traders'],
            "name": 'Question 1',
            "options": [],
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": None,
            "rule": None,
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
            "type": QuestionType.text.value,
            "member_type": [MemberType.retail.value, MemberType.disco.value],
            "isco_type": [IscoType.isco.value],
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
            "isco_type": ['ISCO'],
            "mandatory": True,
            "member_type": ['Retail', 'DISCO - Traders'],
            "name": 'Question 1',
            "options": [],
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": None,
            "rule": None,
            "tooltip": 'Question 1 tooltip',
            "tooltip_translations": [
                {"language": "id", "text": "Keterangan Pertanyaan 1"}],
            "translations": [
                {"language": "id", "text": "Pertanyaan 1"}],
            "type": 'text',
            "variable_name": None
        }
