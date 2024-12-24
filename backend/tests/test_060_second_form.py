import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


def datenow():
    now = datetime.utcnow()
    return now.strftime("%d-%m-%Y")


class TestSecondFormRoutes:
    @pytest.mark.asyncio
    async def test_add_form(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # create form
        res = await client.post(
            app.url_path_for("form:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json={
                "name": "Second survey",
                "description": "Form Description",
                "languages": None,
                "enable_prefilled_value": False,
            },
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "created": datenow(),
            "description": "Form Description",
            "id": 2,
            "languages": None,
            "name": "Second survey",
            "published": None,
            "url": None,
            "version": 0.0,
            "enable_prefilled_value": False,
        }

    @pytest.mark.asyncio
    async def test_get_form_by_id(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=2))
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "description": "Form Description",
            "id": 2,
            "languages": None,
            "name": "Second survey",
            "question_group": [],
            "url": None,
            "version": 0.0,
            "enable_prefilled_value": False,
        }

    @pytest.mark.asyncio
    async def test_add_default_group(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for(
                "question_group:create_default", form_id=2, order=1
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "description": None,
            "form": 2,
            "id": 3,
            "isco_access": [],
            "member_access": [],
            "name": "New section - please change name",
            "order": 1,
            "repeat": False,
            "repeat_text": None,
            "leading_question": None,
            "show_repeat_in_question_level": False,
            "translations": [],
            "question": [
                {
                    "cascade": None,
                    "datapoint_name": False,
                    "form": 2,
                    "id": 10,
                    "isco_access": [],
                    "mandatory": False,
                    "member_access": [],
                    "name": "New question - please change name",
                    "option": [],
                    "order": 1,
                    "personal_data": False,
                    "question_group": 3,
                    "repeating_objects": [],
                    "rule": None,
                    "skip_logic": [],
                    "tooltip": None,
                    "tooltip_translations": [],
                    "translations": [],
                    "type": "input",
                    "variable_name": None,
                    "core_mandatory": False,
                    "deactivate": False,
                    "disableDelete": False,
                    "autofield": None,
                    "is_repeat_identifier": False,
                    "show_as_textarea": False,
                }
            ],
        }

    @pytest.mark.asyncio
    async def test_add_default_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.post(
            app.url_path_for(
                "question:create_default",
                form_id=2,
                question_group_id=3,
                order=1,
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "cascade": None,
            "datapoint_name": False,
            "form": 2,
            "id": 11,
            "isco_access": [],
            "mandatory": False,
            "member_access": [],
            "name": "New question - please change name",
            "option": [],
            "order": 1,
            "personal_data": False,
            "question_group": 3,
            "repeating_objects": [],
            "rule": None,
            "skip_logic": [],
            "tooltip": None,
            "tooltip_translations": [],
            "translations": [],
            "type": "input",
            "variable_name": None,
            "core_mandatory": False,
            "deactivate": False,
            "disableDelete": False,
            "autofield": None,
            "is_repeat_identifier": False,
            "show_as_textarea": False,
        }
