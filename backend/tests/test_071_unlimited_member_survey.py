import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
# set to different account
account = Acc(email="galih@test.org", token=None)
org_name = "Organisation DISCO - Traders Member and DISCO isco"
today = datetime.today().strftime("%B %d, %Y")


class TestCreateUnlimitedMemberQuestionnaire():
    @pytest.mark.asyncio
    async def test_get_webform_from_bucket(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(
            app.url_path_for(
                "form:get_webform_from_bucket",
                form_id=1
            ),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert "form" in res
        form = res["form"]
        assert form["id"] == 1
        assert "en" in form["languages"]
        assert len(form['question_group']) > 0
        for qg in form["question_group"]:
            assert len(qg["member_access"]) > 0
            assert len(qg["isco_access"]) > 0
            for q in qg["question"]:
                assert len(q["member_access"]) > 0
                assert len(q["isco_access"]) > 0

    @pytest.mark.asyncio
    async def test_save_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        payload = [{
            "question": 1,
            "repeat_index": 0,
            "comment": "Q1 comment",
            "value": "Option 1"
        }]
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=0),
            params={"locked_by": 2},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 2,
            "form": 1,
            "form_name": "Form Test",
            "name": "",
            "geo": None,
            "locked_by": 2,
            "created": today,
            "created_by": "Galih",
            "organisation": org_name,
            "submitted_by": None,
            "updated": None,
            "submitted": None,
            "answer": [{
                "comment": "Q1 comment",
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1"
            }]
        }

    @pytest.mark.asyncio
    async def test_get_saved_submission(self, app: FastAPI, session: Session,
                                        client: AsyncClient) -> None:
        res = await client.get(
            app.url_path_for("data:get_saved_data_by_organisation"),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert len(res) > 0
        assert res[0] == {
            "created": today,
            "created_by": "Galih",
            "form": 1,
            "form_type": "member",
            "id": 2,
            "locked_by": 2,
            'locked_by_user': 'Galih',
            "name": f"Form Test - {org_name} - Galih - {today}",
            "organisation": org_name,
        }

    @pytest.mark.asyncio
    async def test_get_second_webform_from_bucket(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(
            app.url_path_for(
                "form:get_webform_from_bucket",
                form_id=1
            ),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_submit_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for("data:create", form_id=1, submitted=1),
            params={"locked_by": 2},
            json=[{
                "question": 1,
                "repeat_index": 0,
                "comment": None,
                "value": "Option 1"
            }, {
                "question": 2,
                "repeat_index": 0,
                "comment": None,
                "value": "Direct submit"
            }, {
                "question": 3,
                "repeat_index": 0,
                "comment": None,
                "value": "Female"
            }, {
                "question": 4,
                "repeat_index": 0,
                "comment": None,
                "value": 35
            }, {
                "question": 5,
                "repeat_index": 0,
                "comment": "Q5 comment",
                "value": 55
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "id": 3,
            "form": 1,
            "form_name": "Form Test",
            "name": "Direct submit",
            "geo": None,
            "locked_by": 2,
            "created": today,
            "created_by": "Galih",
            "organisation": org_name,
            "submitted_by": "Galih",
            "updated": today,
            "submitted": today,
            "answer": [{
                "comment": None,
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1"
            }, {
                "comment": None,
                "question": 2,
                "repeat_index": 0,
                "value": "Direct submit"
            }, {
                "comment": None,
                "question": 3,
                "repeat_index": 0,
                "value": "Female"
            }, {
                "comment": None,
                "question": 4,
                "repeat_index": 0,
                "value": 35
            }, {
                "comment": "Q5 comment",
                "question": 5,
                "repeat_index": 0,
                "value": 55
            }]
        }

    @pytest.mark.asyncio
    async def test_get_third_webform_from_bucket(
        self,
        app: FastAPI,
        session: Session,
        client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(
            app.url_path_for(
                "form:get_webform_from_bucket",
                form_id=1
            ),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
