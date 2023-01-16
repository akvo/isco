import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.question import QuestionType
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestQuestionRoutes():
    @pytest.mark.asyncio
    async def test_update_question_wtih_deactivate(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
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
            "tooltip_translations": [{
                "language": "id",
                "tooltip_translations": "Keterangan Pertanyaan 1"}],
            "cascade": None,
            "repeating_objects": None,
            "order": 1,
            "option": None,
            "member_access": None,
            "isco_access": None,
            "skip_logic": None,
            "core_mandatory": True,
            "deactivate": False,
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
            "option": [{
                "code": "opt1",
                "id": 1,
                "name": "Option 1",
                "order": 1,
                "question": 1,
                    "translations": [
                        {"language": "id", "text": "Pilihan 1"}]
            }],
            "order": 1,
            "personal_data": False,
            "question_group": 1,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": 'Question 1 tooltip',
            "tooltip_translations": [{
                "language": "id",
                "tooltip_translations": "Keterangan Pertanyaan 1"}],
            "translations": [{
                "language": "id", "text": "Pertanyaan 1"}],
            "type": "option",
            "variable_name": None,
            "core_mandatory": True,
            "deactivate": False,
        }
