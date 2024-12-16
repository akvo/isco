import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy import and_
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import true
from models.data import Data
from models.form import Form
from util.common import get_prev_year
from db import crud_data, crud_collaborator, crud_question
from datetime import datetime

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
prev_date = get_prev_year().strftime("%B %d, %Y")
today = datetime.today().strftime("%B %d, %Y")


class TestPrefilledRoute:
    @pytest.mark.asyncio
    async def test_get_previous_project_submission(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # update one of our project submission data
        # submitted value to prev year value
        form = (
            session.query(Form)
            .filter(Form.enable_prefilled_value == true())
            .first()
        )
        submitted_project = (
            session.query(Data)
            .filter(and_(Data.form.in_([form.id]), Data.submitted.isnot(None)))
            .first()
        )
        submitted_project.submitted = get_prev_year()
        crud_data.update_data(session=session, data=submitted_project)
        data = crud_data.get_data_by_id(
            session=session, id=submitted_project.id
        )
        assert data.submitted.year == get_prev_year(year=True)
        # don't allow unsubmit submission from prev year
        res = await client.put(
            app.url_path_for("data:unsubmit", id=submitted_project.id),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 401
        # get prev project submission list
        res = await client.get(
            app.url_path_for(
                "prefilled:get_previous_project_submission", form_id=data.form
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        name = "Form with computed validation - staff Akvo"
        name += " - John Doe - " + prev_date
        assert res == [
            {
                "id": 6,
                "form": 4,
                "is_name_configured": False,
                "datapoint_name": name,
                "submitted_by": "John Doe",
                "submitted": prev_date,
            }
        ]

    @pytest.mark.asyncio
    async def test_update_question_set_datapoint_name_true(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # Update datapoint_name to True after submission completed
        # to check func generate_datapoint_name work as expected
        # how about if that datapoint_name True question deactivated ?
        # change question type from number to input
        question = crud_question.get_question_by_id(session=session, id=16)
        question_payload = {
            "form": question.form,
            "question_group": question.question_group,
            "name": "Your Name",
            "translations": None,
            "mandatory": False,
            "datapoint_name": True,
            "variable_name": None,
            "type": "input",
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
            "autofield": None,
            "is_repeat_identifier": False,
        }
        res = await client.put(
            app.url_path_for("question:put", id=question.id),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload,
        )
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 16
        assert res["datapoint_name"] is True

    @pytest.mark.asyncio
    async def test_get_previous_project_submission_after_set_dpname(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # update one of our project submission data
        # submitted value to prev year value
        form = (
            session.query(Form)
            .filter(Form.enable_prefilled_value == true())
            .first()
        )
        submitted_project = (
            session.query(Data)
            .filter(and_(Data.form.in_([form.id]), Data.submitted.isnot(None)))
            .first()
        )
        submitted_project.submitted = get_prev_year()
        crud_data.update_data(session=session, data=submitted_project)
        data = crud_data.get_data_by_id(
            session=session, id=submitted_project.id
        )
        assert data.submitted.year == get_prev_year(year=True)
        # get prev project submission list
        res = await client.get(
            app.url_path_for(
                "prefilled:get_previous_project_submission", form_id=data.form
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        name = "My name is Lorem Ipsum"
        name += " - John Doe - " + prev_date
        assert res == [
            {
                "id": 6,
                "form": 4,
                "is_name_configured": False,
                "datapoint_name": name,
                "submitted_by": "John Doe",
                "submitted": prev_date,
            }
        ]
        # get project form definition with prefilled value
        res = await client.get(
            app.url_path_for(
                "prefilled:get_webform_with_previous_submission", form_id=100
            ),
            params={"data_id": 100},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404  # form not found
        # get project form definition with prefilled value
        res = await client.get(
            app.url_path_for(
                "prefilled:get_webform_with_previous_submission", form_id=1
            ),
            params={"data_id": 100},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 400  # form not enable prefilled value
        # get project form definition with prefilled value
        res = await client.get(
            app.url_path_for(
                "prefilled:get_webform_with_previous_submission",
                form_id=data.form,
            ),
            params={"data_id": data.id},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": {
                "id": 4,
                "name": "Form with computed validation",
                "description": "Form Description",
                "languages": ["en"],
                "question_group": [
                    {
                        "id": 5,
                        "name": "Computed Validation Group 1",
                        "description": "Description",
                        "order": 1,
                        "repeatable": False,
                        "leading_question": None,
                        "member_access": ["All"],
                        "isco_access": ["All"],
                        "question": [
                            {
                                "id": 14,
                                "name": "Percentage 1",
                                "required": False,
                                "datapoint_name": False,
                                "type": "number",
                                "order": 1,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": False,
                                "deactivate": False,
                                "is_repeat_identifier": False,
                            },
                            {
                                "id": 15,
                                "name": "Percentage 2",
                                "required": False,
                                "datapoint_name": False,
                                "type": "number",
                                "order": 2,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": False,
                                "deactivate": False,
                                "is_repeat_identifier": False,
                            },
                            {
                                "id": 16,
                                "name": "Your Name",
                                "required": False,
                                "datapoint_name": False,
                                "type": "input",
                                "order": 3,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": False,
                                "deactivate": False,
                                "is_repeat_identifier": False,
                            },
                        ],
                    }
                ],
                "version": 3.0,
            },
            "initial_values": {
                "id": 6,
                "name": "",
                "form": 4,
                "form_name": "Form with computed validation",
                "geo": None,
                "locked_by": None,
                "created_by": "John Doe",
                "organisation": "staff Akvo",
                "submitted_by": "John Doe",
                "created": today,
                "updated": today,
                "submitted": prev_date,
                "answer": [
                    {
                        "question": 14,
                        "repeat_index": 0,
                        "comment": None,
                        "value": 40,
                    },
                    {
                        "question": 15,
                        "repeat_index": 0,
                        "comment": None,
                        "value": 60,
                    },
                    {
                        "question": 16,
                        "repeat_index": 0,
                        "comment": None,
                        "value": "My name is Lorem Ipsum",
                    },
                ],
            },
            "mismatch": False,
            "collaborators": [
                {"data": 6, "id": 3, "organisation": 2},
                {"data": 6, "id": 4, "organisation": 3},
            ],
        }

    @pytest.mark.asyncio
    async def test_save_then_submit_prefilled_project_questionnaire(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        payload = [
            {"question": 14, "repeat_index": 0, "comment": None, "value": 50},
            {"question": 15, "repeat_index": 0, "comment": None, "value": 50},
        ]
        # save data
        collaborator_params = [2, 3]
        res = await client.post(
            app.url_path_for("data:create", form_id=4, submitted=0),
            params={"locked_by": 1, "collaborators": collaborator_params},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 8
        # check if collaborator inserted
        collaborators = crud_collaborator.get_collaborator_by_data(
            session=session, data=8
        )
        collaborators = [c.organisation for c in collaborators]
        assert collaborators == collaborator_params
        # submit saved data
        res = await client.put(
            app.url_path_for("data:update", id=8, submitted=1),
            json=[
                {
                    "question": 14,
                    "repeat_index": 0,
                    "comment": None,
                    "value": 50,
                },
                {
                    "question": 15,
                    "repeat_index": 0,
                    "comment": None,
                    "value": 50,
                },
            ],
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_submit_prefilled_project_questionnaire(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        payload = [
            {"question": 14, "repeat_index": 0, "comment": None, "value": 51},
            {"question": 15, "repeat_index": 0, "comment": None, "value": 49},
        ]
        # direct submit data
        collaborator_params = [3]
        res = await client.post(
            app.url_path_for("data:create", form_id=4, submitted=1),
            params={"locked_by": 1, "collaborators": collaborator_params},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 9
        # check if collaborator inserted
        collaborators = crud_collaborator.get_collaborator_by_data(
            session=session, data=9
        )
        collaborators = [c.organisation for c in collaborators]
        assert collaborators == collaborator_params
