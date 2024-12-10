import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc
import util.storage as storage

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestQuestionRoutes:
    @pytest.mark.asyncio
    async def test_update_question_with_deactivate(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get question
        res = await client.get(app.url_path_for("question:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # deactivate question
        question_payload = [
            {
                "id": 1,
                "deactivate": True,
            }
        ]
        res = await client.put(
            app.url_path_for("question:bulk_deactivate"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload,
        )
        assert res.status_code == 204
        res = await client.get(app.url_path_for("question:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["deactivate"] is True
        # activate question
        question_payload = [
            {
                "id": 1,
                "deactivate": False,
            }
        ]
        res = await client.put(
            app.url_path_for("question:bulk_deactivate"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload,
        )
        assert res.status_code == 204
        res = await client.get(app.url_path_for("question:get_by_id", id=1))
        assert res.status_code == 200
        res = res.json()
        assert res["deactivate"] is False

    async def test_get_form_to_deactivate_questions_in_a_group(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("form:get_webform_from_bucket", form_id=4),
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
                            },
                            {
                                "id": 17,
                                "name": "Autofield Question",
                                "required": False,
                                "datapoint_name": False,
                                "type": "autofield",
                                "order": 4,
                                "member_access": ["All"],
                                "isco_access": ["All"],
                                "coreMandatory": False,
                                "deactivate": False,
                                "fn": {
                                    "fnString": "function () { return #15 }",
                                    "multiline": False,
                                },
                            },
                        ],
                    }
                ],
                "version": 1,
            }
        }

    async def test_deactivate_group_in_form_4(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # deactivate question
        question_payload = [
            {
                "id": 14,
                "deactivate": True,
            },
            {
                "id": 15,
                "deactivate": True,
            },
            {
                "id": 16,
                "deactivate": True,
            },
            {
                "id": 17,
                "deactivate": True,
            },
        ]
        res = await client.put(
            app.url_path_for("question:bulk_deactivate"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload,
        )
        assert res.status_code == 204
        # get form
        form = await client.get(app.url_path_for("form:get_by_id", id=4))
        assert form.status_code == 200
        form = form.json()
        # publish form
        res = await client.post(
            app.url_path_for("form:publish"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": 4},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["version"] == form["version"] + 1
        assert res["url"] is not None
        assert res["published"] is not None
        assert storage.check(res["url"]) is True
        # get published form from storage
        res = await client.get(
            app.url_path_for("form:get_webform_from_bucket", form_id=4),
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
                "question_group": [],
                "version": 2.0,
            }
        }

    async def test_activate_group_in_form_4(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # deactivate question
        question_payload = [
            {
                "id": 14,
                "deactivate": False,
            },
            {
                "id": 15,
                "deactivate": False,
            },
            {
                "id": 16,
                "deactivate": False,
            },
            {
                "id": 17,
                "deactivate": True,
            },
        ]
        res = await client.put(
            app.url_path_for("question:bulk_deactivate"),
            headers={"Authorization": f"Bearer {account.token}"},
            json=question_payload,
        )
        assert res.status_code == 204
        # get form
        form = await client.get(app.url_path_for("form:get_by_id", id=4))
        assert form.status_code == 200
        form = form.json()
        # publish form
        res = await client.post(
            app.url_path_for("form:publish"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": 4},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["version"] == form["version"] + 1
        assert res["url"] is not None
        assert res["published"] is not None
        assert storage.check(res["url"]) is True
        # get published form from storage
        res = await client.get(
            app.url_path_for("form:get_webform_from_bucket", form_id=4),
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
                            },
                        ],
                    }
                ],
                "version": 3.0,
            }
        }
