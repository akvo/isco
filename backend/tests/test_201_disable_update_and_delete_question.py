import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc
from models.question import QuestionType
from db import crud_question

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)


class TestDisableDeleteQuestion():
    @pytest.mark.asyncio
    async def test_disable_update_question_type(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # change question type from number to input
        question = crud_question.get_question_by_id(
            session=session, id=14)
        assert question.type == QuestionType.number
        question_payload = {
            "form": question.form,
            "question_group": question.question_group,
            "name": "Percentage 1",
            "translations": None,
            "mandatory": False,
            "datapoint_name": False,
            "variable_name": None,
            "type": QuestionType.input.value,
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
            "core_mandatory": False,
            "deactivate": False,
        }
        res = await client.put(
            app.url_path_for("question:put", id=question.id),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 400

    @pytest.mark.asyncio
    async def test_disable_delete_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # delete user which has answers
        res = await client.delete(
            app.url_path_for("question:delete", id=14),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 400
