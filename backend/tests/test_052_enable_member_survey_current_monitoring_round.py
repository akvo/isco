import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy import and_
from sqlalchemy.orm import Session
from models.data import Data
from util.common import get_prev_year
from db import crud_data
from datetime import datetime

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
prev_date = get_prev_year().strftime("%B %d, %Y")
today = datetime.today().strftime("%B %d, %Y")


class TestEnableMemberSurveyForCurrentMonitoringRound():
    @pytest.mark.asyncio
    async def test_enable_member_survey_for_current_round(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # update one of our project submission data (member survey)
        # submitted value to prev year value
        form_id = 1
        submitted_member = session.query(Data).filter(and_(
            Data.form == form_id,
            Data.submitted.isnot(None)
        )).first()
        # update
        submitted_member.created = get_prev_year()
        submitted_member.submitted = get_prev_year()
        crud_data.update_data(
            session=session, data=submitted_member)
        data = crud_data.get_data_by_id(
            session=session, id=submitted_member.id)
        assert data.submitted.year == get_prev_year(year=True)
        # try to check if form enabled for the current round
        res = await client.get(
            app.url_path_for("form:get_webform_options"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "disabled": False,
            "label": "Form Test",
            "value": 1,
            "form_type": "member",
            "enable_prefilled_value": False
        }]
        # update back to real submission date
        submitted_member.created = get_prev_year(prev=0)
        submitted_member.submitted = get_prev_year(prev=0)
        crud_data.update_data(
            session=session, data=submitted_member)
        data = crud_data.get_data_by_id(
            session=session, id=submitted_member.id)
        assert data.submitted.year == get_prev_year(prev=0, year=True)
        # check if form enabled
        res = await client.get(
            app.url_path_for("form:get_webform_options"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            "disabled": True,
            "label": "Form Test",
            "value": 1,
            "form_type": "member",
            "enable_prefilled_value": False
        }]
