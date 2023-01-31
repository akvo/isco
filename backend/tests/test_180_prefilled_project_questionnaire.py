import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy import and_
from sqlalchemy.orm import Session
from models.data import Data
from util.survey_config import PROJECT_SURVEY
from util.common import get_prev_year
from db import crud_data

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)


class TestPrefilledRoute():
    @pytest.mark.asyncio
    async def test_get_previous_project_submission(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # update one of our project submission data
        # submitted value to prev year value
        submitted_project = session.query(Data).filter(and_(
            Data.form.in_(PROJECT_SURVEY),
            Data.submitted.isnot(None)
        )).first()
        submitted_project.submitted = get_prev_year()
        crud_data.update_data(
            session=session, data=submitted_project)
        data = crud_data.get_data_by_id(
            session=session, id=submitted_project.id)
        assert data.submitted.year == get_prev_year(year=True)
        # get prev project submission list
        res = await client.get(
            app.url_path_for(
                "prefilled:get_previous_project_submission",
                form_id=data.form),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        name = 'Form with computed validation - staff Akvo'
        name += ' - John Doe - January 31, 2022'
        assert res == [{
            'id': 6,
            'datapoint_name': name
        }]
        # get project form definition with prefilled value
        res = await client.get(
            app.url_path_for(
                "prefilled:get_webform_with_previous_submission",
                form_id=data.form),
            params={"data_id": data.id},
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": {
                "id": 4,
                "name": "Form with computed validation",
                "description": "Form Description",
                "languages": ["en"],
                "question_group": [{
                    "id": 5,
                    "name": "Computed Validation Group 1",
                    "description": "Description",
                    "order": 1,
                    "repeatable": False,
                    "member_access": [],
                    "isco_access": [],
                    "question": [{
                        "id": 14,
                        "name": "Percentage 1",
                        "required": False,
                        "datapoint_name": False,
                        "type": "number",
                        "order": 1,
                        "member_access": [],
                        "isco_access": [],
                        "coreMandatory": False,
                        "deactivate": False,
                    }, {
                        "id": 15,
                        "name": "Percentage 2",
                        "required": False,
                        "datapoint_name": False,
                        "type": "number",
                        "order": 2,
                        "member_access": [],
                        "isco_access": [],
                        "coreMandatory": False,
                        "deactivate": False,
                    }],
                }],
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
                "created": "January 31, 2023",
                "updated": "January 31, 2023",
                "submitted": "January 31, 2022",
                "answer": [{
                    "question": 14,
                    "repeat_index": 0,
                    "comment": None,
                    "value": 40
                }, {
                    "question": 15,
                    "repeat_index": 0,
                    "comment": None,
                    "value": 60
                }],
            },
            "mismatch": False,
        }
