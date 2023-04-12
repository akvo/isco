import sys
import pytest
import util.storage as storage
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


class TestFormWithComputedValidationRoutes():
    @pytest.mark.asyncio
    async def test_add_computed_validation_form(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # create form
        res = await client.post(
            app.url_path_for("form:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "name": "Form with computed validation",
                "description": "Form Description",
                "languages": None,
                "enable_prefilled_value": True
            }
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "created": datenow(),
            "description": "Form Description",
            "id": 4,
            "languages": None,
            "name": "Form with computed validation",
            "published": None,
            "url": None,
            "version": 0.0,
            "enable_prefilled_value": True
        }

    @pytest.mark.asyncio
    async def test_add_computed_validation_question_group(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=4))
        assert res.status_code == 200
        # create question group
        res = await client.post(
            app.url_path_for("question_group:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "form": 4,
                "name": "Computed Validation Group 1",
                "description": "Description",
                "translations": None,
                "repeat": False,
                "repeat_text": None,
                "order": 1,
                "member_access": [1],
                "isco_access": [1],
                "question": None
            })
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "description": "Description",
            "form": 4,
            "id": 5,
            "isco_access": [1],
            "member_access": [1],
            "name": "Computed Validation Group 1",
            "order": 1,
            "repeat": False,
            "repeat_text": None,
            "translations": [],
            "question": []
        }

    @pytest.mark.asyncio
    async def test_add_computed_validation_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=4))
        assert res.status_code == 200
        # get question group
        res = await client.get(
            app.url_path_for("question_group:get_by_id", id=5))
        assert res.status_code == 200
        # add question type number
        question_payload = {
            "form": 4,
            "question_group": 5,
            "name": "Percentage 1",
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
            "repeating_objects": None,
            "order": 1,
            "option": None,
            "member_access": None,
            "isco_access": None,
            "skip_logic": None,
            "core_mandatory": False,
            "deactivate": False,
        }
        res = await client.post(
            app.url_path_for("question:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 14,
            "cascade": None,
            "datapoint_name": False,
            "form": 4,
            "isco_access": [],
            "mandatory": False,
            "member_access": [],
            "name": 'Percentage 1',
            "option": [],
            "order": 1,
            "personal_data": False,
            "question_group": 5,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": None,
            "tooltip_translations": [],
            "translations": [],
            "type": 'number',
            "variable_name": None,
            "core_mandatory": False,
            "deactivate": False,
            "disableDelete": False,
        }
        #
        # add question type number
        question_payload = {
            "form": 4,
            "question_group": 5,
            "name": "Percentage 2",
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
            "repeating_objects": None,
            "order": 2,
            "option": None,
            "member_access": None,
            "isco_access": None,
            "skip_logic": None,
            "core_mandatory": False,
            "deactivate": False,
        }
        res = await client.post(
            app.url_path_for("question:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 15,
            "cascade": None,
            "datapoint_name": False,
            "form": 4,
            "isco_access": [],
            "mandatory": False,
            "member_access": [],
            "name": 'Percentage 2',
            "option": [],
            "order": 2,
            "personal_data": False,
            "question_group": 5,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": None,
            "tooltip_translations": [],
            "translations": [],
            "type": 'number',
            "variable_name": None,
            "core_mandatory": False,
            "deactivate": False,
            "disableDelete": False,
        }
        #
        # add question type input
        question_payload = {
            "form": 4,
            "question_group": 5,
            "name": "Your Name",
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
            "order": 3,
            "option": None,
            "member_access": None,
            "isco_access": None,
            "skip_logic": None,
            "core_mandatory": False,
            "deactivate": False,
        }
        res = await client.post(
            app.url_path_for("question:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload)
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 16,
            "cascade": None,
            "datapoint_name": False,
            "form": 4,
            "isco_access": [],
            "mandatory": False,
            "member_access": [],
            "name": 'Your Name',
            "option": [],
            "order": 3,
            "personal_data": False,
            "question_group": 5,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": None,
            "tooltip_translations": [],
            "translations": [],
            "type": 'input',
            "variable_name": None,
            "core_mandatory": False,
            "deactivate": False,
            "disableDelete": False,
        }

    @pytest.mark.asyncio
    async def test_publish_computed_validation_form(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        form = await client.get(app.url_path_for("form:get_by_id", id=4))
        assert form.status_code == 200
        form = form.json()
        assert form['enable_prefilled_value'] is True
        # publish form
        res = await client.post(
            app.url_path_for("form:publish"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": 4})
        assert res.status_code == 200
        res = res.json()
        assert res["version"] == form["version"] + 1
        assert res["url"] is not None
        assert res["published"] is not None
        assert storage.check(res["url"]) is True
