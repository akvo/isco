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
    async def test_get_list_of_previous_project_submission(
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
            app.url_path_for("prefilled:get_previous_project_submission"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        name = 'Form with computed validation - staff Akvo'
        name += ' - John Doe - January 31, 2022'
        assert res == [{
            'id': 6,
            'datapoint_name': name
        }]
