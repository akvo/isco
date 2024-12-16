import sys
import pytest
import util.storage as storage

from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)

form_id = 5


def datenow():
    now = datetime.utcnow()
    return now.strftime("%d-%m-%Y")


class TestFormWithLeadingQuestionForRepeatGroup:
    @pytest.mark.asyncio
    async def test_publish_form_with_leading_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        form = await client.get(app.url_path_for("form:get_by_id", id=form_id))
        assert form.status_code == 200
        form = form.json()
        # publish form
        res = await client.post(
            app.url_path_for("form:publish"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": form_id},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["version"] == form["version"] + 1
        assert res["url"] is not None
        assert res["published"] is not None
        assert storage.check(res["url"]) is True

    @pytest.mark.asyncio
    async def test_get_publish_form_with_leading_question(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get published form from storage
        res = await client.get(
            app.url_path_for("form:get_webform_from_bucket", form_id=form_id),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == {
            "form": {
                "id": 5,
                "name": "Test form with leading question",
                "description": "Lorem ipsum",
                "languages": ["en"],
                "question_group": [
                    {
                        "id": 6,
                        "name": "Group 1",
                        "description": "Group 1 description",
                        "order": 1,
                        "repeatable": False,
                        "leading_question": None,
                        "member_access": ["All"],
                        "isco_access": ["All"],
                        "question": [
                            {
                                "id": 18,
                                "name": "Name",
                                "required": True,
                                "datapoint_name": False,
                                "type": "text",
                                "order": 1,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": True,
                                "deactivate": False,
                                "is_repeat_identifier": False,
                            },
                            {
                                "id": 19,
                                "name": "Option Leading Question",
                                "required": False,
                                "datapoint_name": False,
                                "type": "multiple_option",
                                "order": 2,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": False,
                                "deactivate": False,
                                "is_repeat_identifier": False,
                                "option": [
                                    {
                                        "code": None,
                                        "name": "Indonesia",
                                        "order": 1,
                                    },
                                    {
                                        "code": None,
                                        "name": "Singapore",
                                        "order": 2,
                                    },
                                ],
                                "lead_repeat_group": [7],
                            },
                        ],
                    },
                    {
                        "id": 7,
                        "name": "Group 2 Updated",
                        "description": "Group 2 description",
                        "order": 2,
                        "repeatable": True,
                        "leading_question": 19,
                        "member_access": ["All"],
                        "isco_access": ["All"],
                        "question": [
                            {
                                "id": 20,
                                "name": "Option Leading Question",
                                "required": False,
                                "datapoint_name": False,
                                "type": "multiple_option",
                                "order": 1,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": False,
                                "deactivate": False,
                                "is_repeat_identifier": True,
                                "option": [
                                    {
                                        "code": None,
                                        "name": "Indonesia",
                                        "order": 1,
                                    },
                                    {
                                        "code": None,
                                        "name": "Singapore",
                                        "order": 2,
                                    },
                                ],
                            },
                            {
                                "id": 21,
                                "name": "Weight",
                                "required": True,
                                "datapoint_name": False,
                                "type": "number",
                                "order": 2,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": True,
                                "deactivate": False,
                                "is_repeat_identifier": False,
                            },
                            {
                                "id": 22,
                                "name": "Price",
                                "required": False,
                                "datapoint_name": False,
                                "type": "number",
                                "order": 3,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": False,
                                "deactivate": False,
                                "is_repeat_identifier": False,
                            },
                        ],
                        "repeatButtonPlacement": "bottom",
                        "repeat_text": "Add another",
                    },
                ],
                "version": 1,
            }
        }
