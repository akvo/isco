import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from models.user import UserRole
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email="galih@test.org", token=None)
org_name = "Organisation DISCO - Traders Member and DISCO isco"
today = datetime.today().strftime("%B %d, %Y")


class TestThirdSubmissionRoutes():
    @pytest.mark.asyncio
    async def test_user_assigned(self, app: FastAPI, session: Session,
                                 client: AsyncClient) -> None:
        user_id = 2
        user_payload = {
            "role": UserRole.secretariat_admin.value,
            "organisation": 3,
            "questionnaires": [1, 2, 3],
        }
        res = await client.put(
            app.url_path_for("user:update_by_admin", id=user_id),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"approved": 1},
            json=user_payload)
        assert res.status_code == 200
        res = res.json()
        assert res["approved"] is True

    @pytest.mark.asyncio
    async def test_save_data(self, app: FastAPI, session: Session,
                             client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=3, submitted=1),
            params={"locked_by": 1},
            json=[{
                "question": 8,
                "repeat_index": 0,
                "comment": None,
                "value": "Testing 1"
            }, {
                "question": 9,
                "repeat_index": 0,
                "comment": "This is comment",
                "value": "Testing 2"
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 4,
            "form": 3,
            "form_name": "Third limited survey",
            "name": "",
            "geo": None,
            "locked_by": 1,
            "created": today,
            "created_by": "Galih",
            "organisation": org_name,
            "submitted_by": "Galih",
            "updated": today,
            "submitted": today,
            "answer": [
                {
                    "comment": None,
                    "question": 8,
                    "repeat_index": 0,
                    "value": "Testing 1"
                },
                {
                    "comment": "This is comment",
                    "question": 9,
                    "repeat_index": 0,
                    "value": "Testing 2"
                }
            ]
        }

    @pytest.mark.asyncio
    async def test_get_form_options(self, app: FastAPI, session: Session,
                                    client: AsyncClient) -> None:
        # get form
        res = await client.get(
            app.url_path_for("form:get_webform_options"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            'label': 'Form Test',
            'value': 1,
            'disabled': False
        }, {
            'label': 'Third limited survey',
            'value': 3,
            'disabled': True
        }]

    @pytest.mark.asyncio
    async def test_submit_third_survey_again(self, app: FastAPI,
                                             session: Session,
                                             client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=3, submitted=1),
            params={"locked_by": 1},
            json=[{
                "question": 8,
                "repeat_index": 0,
                "comment": None,
                "value": "Testing 1"
            }, {
                "question": 9,
                "repeat_index": 0,
                "comment": "This is comment",
                "value": "Testing 2"
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 208
