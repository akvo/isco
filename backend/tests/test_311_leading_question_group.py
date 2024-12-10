import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime
from tests.test_000_main import Acc
from models.question import QuestionType

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


def datenow():
    now = datetime.utcnow()
    return now.strftime("%d-%m-%Y")


class TestFormWithLeadingQuestionForRepeatGroup:
    @pytest.mark.asyncio
    async def test_add_form_leading_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # create form
        res = await client.post(
            app.url_path_for("form:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "name": "Test form with leading question",
                "description": "Lorem ipsum",
                "languages": None,
                "enable_prefilled_value": True,
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "created": datenow(),
            "description": "Lorem ipsum",
            "id": 5,
            "languages": None,
            "name": "Test form with leading question",
            "published": None,
            "url": None,
            "version": 0.0,
            "enable_prefilled_value": True,
        }

    @pytest.mark.asyncio
    async def test_add_first_question_group_with_leading_question_inside(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        form_id = 5
        res = await client.get(app.url_path_for("form:get_by_id", id=form_id))
        assert res.status_code == 200
        res = res.json()
        assert len(res["question_group"]) == 0
        # create question group with question
        question_group_payload = {
            "form": form_id,
            "name": "Group 1",
            "description": "Group 1 description",
            "translations": None,
            "repeat": False,
            "repeat_text": None,
            "order": 1,
            "member_access": [1],
            "isco_access": [1],
            "leading_question": None,
            "question": [
                {
                    "form": None,
                    "question_group": None,
                    "name": "Name",
                    "translations": None,
                    "mandatory": True,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": QuestionType.text.value,
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
                    "deactivate": False,
                    "autofield": None,
                },
                {
                    "form": None,
                    "question_group": None,
                    "name": "Cascade Leading Question",
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
                    "order": 2,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": False,
                    "deactivate": False,
                    "autofield": None,
                },
            ],
        }
        res = await client.post(
            app.url_path_for("question_group:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_group_payload,
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 6,
            "form": form_id,
            "name": "Group 1",
            "description": "Group 1 description",
            "translations": [],
            "order": 1,
            "repeat": False,
            "repeat_text": None,
            "member_access": [1],
            "isco_access": [1],
            "leading_question": None,
            "question": [
                {
                    "id": 18,
                    "form": 5,
                    "question_group": 6,
                    "name": "Name",
                    "translations": [],
                    "mandatory": True,
                    "core_mandatory": True,
                    "deactivate": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": "text",
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": [],
                    "member_access": [1],
                    "isco_access": [1],
                    "cascade": None,
                    "repeating_objects": [],
                    "option": [],
                    "skip_logic": [],
                    "order": 1,
                    "disableDelete": False,
                    "autofield": None,
                },
                {
                    "id": 19,
                    "form": 5,
                    "question_group": 6,
                    "name": "Cascade Leading Question",
                    "translations": [],
                    "mandatory": False,
                    "core_mandatory": False,
                    "deactivate": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": "cascade",
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": [],
                    "member_access": [1],
                    "isco_access": [1],
                    "cascade": 1,
                    "repeating_objects": [],
                    "option": [],
                    "skip_logic": [],
                    "order": 2,
                    "disableDelete": False,
                    "autofield": None,
                },
            ],
        }

    @pytest.mark.asyncio
    async def test_add_second_question_group_as_repeat_group(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        form_id = 5
        res = await client.get(app.url_path_for("form:get_by_id", id=form_id))
        assert res.status_code == 200
        res = res.json()
        assert len(res["question_group"]) == 1
        # create question group with question
        question_group_payload = {
            "form": form_id,
            "name": "Group 2",
            "description": "Group 2 description",
            "translations": None,
            "repeat": True,
            "repeat_text": None,
            "order": 2,
            "member_access": [1],
            "isco_access": [1],
            "leading_question": 19,
            "question": [
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
                    "repeating_objects": None,
                    "order": 1,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": True,
                    "deactivate": False,
                    "autofield": None,
                },
                {
                    "form": None,
                    "question_group": None,
                    "name": "Price",
                    "translations": None,
                    "mandatory": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": QuestionType.number.value,
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": None,
                    "cascade": None,
                    "repeating_objects": [],
                    "order": 2,
                    "option": None,
                    "member_access": None,
                    "isco_access": None,
                    "skip_logic": None,
                    "core_mandatory": False,
                    "deactivate": False,
                    "autofield": None,
                },
            ],
        }
        res = await client.post(
            app.url_path_for("question_group:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_group_payload,
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 7,
            "form": form_id,
            "name": "Group 2",
            "description": "Group 2 description",
            "translations": [],
            "order": 2,
            "repeat": True,
            "repeat_text": None,
            "member_access": [1],
            "isco_access": [1],
            "leading_question": 19,
            "question": [
                {
                    "id": 20,
                    "form": 5,
                    "question_group": 7,
                    "name": "Weight",
                    "translations": [],
                    "mandatory": True,
                    "core_mandatory": True,
                    "deactivate": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": "number",
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": [],
                    "member_access": [1],
                    "isco_access": [1],
                    "cascade": None,
                    "repeating_objects": [],
                    "option": [],
                    "skip_logic": [],
                    "order": 1,
                    "disableDelete": False,
                    "autofield": None,
                },
                {
                    "id": 21,
                    "form": 5,
                    "question_group": 7,
                    "name": "Price",
                    "translations": [],
                    "mandatory": False,
                    "core_mandatory": False,
                    "deactivate": False,
                    "datapoint_name": False,
                    "variable_name": None,
                    "type": "number",
                    "personal_data": False,
                    "rule": None,
                    "tooltip": None,
                    "tooltip_translations": [],
                    "member_access": [1],
                    "isco_access": [1],
                    "cascade": None,
                    "repeating_objects": [],
                    "option": [],
                    "skip_logic": [],
                    "order": 2,
                    "disableDelete": False,
                    "autofield": None,
                },
            ],
        }

    @pytest.mark.asyncio
    async def test_update_repeat_question_group(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # update repeat group: repeat False; leading_question: None;
        res = await client.put(
            app.url_path_for("question_group:put", id=7),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "form": 5,
                "name": "Group 2 Updated",
                "description": "Group 2 description",
                "translations": None,
                "repeat": True,
                "repeat_text": None,
                "order": 2,
                "member_access": [1],
                "isco_access": [1],
                "leading_question": None,
                "question": None,
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 7,
            "form": 5,
            "name": "Group 2 Updated",
            "description": "Group 2 description",
            "translations": [],
            "order": 2,
            "repeat": True,
            "repeat_text": None,
            "member_access": [1],
            "isco_access": [1],
            "leading_question": None,
            "question": res["question"],
        }

        # update repeat group: repeat False; leading_question: 19;
        res = await client.put(
            app.url_path_for("question_group:put", id=7),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "form": 5,
                "name": "Group 2 Updated",
                "description": "Group 2 description",
                "translations": None,
                "repeat": False,
                "repeat_text": None,
                "order": 2,
                "member_access": [1],
                "isco_access": [1],
                "leading_question": 19,
                "question": None,
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 7,
            "form": 5,
            "name": "Group 2 Updated",
            "description": "Group 2 description",
            "translations": [],
            "order": 2,
            "repeat": False,
            "repeat_text": None,
            "member_access": [1],
            "isco_access": [1],
            "leading_question": None,
            "question": res["question"],
        }

        # update repeat group: repeat True; leading_question: 19;
        res = await client.put(
            app.url_path_for("question_group:put", id=7),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "form": 5,
                "name": "Group 2 Updated",
                "description": "Group 2 description",
                "translations": None,
                "repeat": True,
                "repeat_text": None,
                "order": 2,
                "member_access": [1],
                "isco_access": [1],
                "leading_question": 19,
                "question": None,
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 7,
            "form": 5,
            "name": "Group 2 Updated",
            "description": "Group 2 description",
            "translations": [],
            "order": 2,
            "repeat": True,
            "repeat_text": None,
            "member_access": [1],
            "isco_access": [1],
            "leading_question": 19,
            "question": res["question"],
        }