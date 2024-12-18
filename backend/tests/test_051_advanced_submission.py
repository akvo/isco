import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session
from util.common import get_prev_year

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
today = datetime.today().strftime("%B %d, %Y")


class TestAdvancedSubmissionRoute:
    @pytest.mark.asyncio
    async def test_get_all_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            params={"submitted": True},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "total" in res
        assert "total_page" in res
        assert "data" in res
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            params={"submitted": True, "filter_same_isco": True},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "total" in res
        assert "total_page" in res
        assert "data" in res
        # test filter with organisation
        filter_org_id = 1
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            params={
                "submitted": True,
                "filter_same_isco": True,
                "organisation": filter_org_id,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "total" in res
        assert "total_page" in res
        assert "data" in res
        assert len(res["data"]) > 0
        org_ids = []
        for d in res["data"]:
            org_ids.append(d.get("organisation"))
        org_ids = set(org_ids)
        assert len(org_ids) == 1
        assert list(org_ids)[0] == filter_org_id
        # test filter with monitoring round
        monitoring_round = get_prev_year(prev=0, year=True)
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            params={
                "submitted": True,
                "filter_same_isco": True,
                "monitoring_round": monitoring_round,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "total" in res
        assert "total_page" in res
        assert "data" in res
        assert res["total"] > 0
        # test filter with data_id
        monitoring_round = get_prev_year(prev=0, year=True)
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            params={
                "submitted": True,
                "filter_same_isco": True,
                "monitoring_round": monitoring_round,
                "data_id": 1,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert "current" in res
        assert "total" in res
        assert "total_page" in res
        assert "data" in res
        assert res["total"] > 0
        # test filter with data_id not found
        monitoring_round = get_prev_year(prev=0, year=True)
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            params={
                "submitted": True,
                "filter_same_isco": True,
                "monitoring_round": monitoring_round,
                "data_id": 1000,
            },
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 404
        # normal fetch data
        res = await client.get(
            app.url_path_for("data:get", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["current"] == 1
        assert res["total"] is not None
        assert res["total_page"] is not None
        assert len(res["data"]) > 0
        assert res["data"] == [
            {
                "id": 1,
                "form": 1,
                "form_name": "Form Test",
                "name": "Option 1 - Option 1",
                "geo": None,
                "created": today,
                "organisation": 1,
                "organisation_name": "staff Akvo",
                "member_type": "All",
                "updated": today,
                "submitted": today,
                "answer": [
                    {
                        "question_group": "Question Group 1",
                        "question_group_order": 1,
                        "question_group_leading_question": None,
                        "question": 1,
                        "question_name": "Question 1",
                        "question_order": 1,
                        "repeat_index": 0,
                        "comment": None,
                        "is_repeat_identifier": False,
                        "value": "Option 1",
                    },
                    {
                        "question_group": "Question Group 1",
                        "question_group_order": 1,
                        "question_group_leading_question": None,
                        "question": 2,
                        "question_name": "Question 2",
                        "question_order": 2,
                        "repeat_index": 0,
                        "comment": "This is comment",
                        "is_repeat_identifier": False,
                        "value": "Depend to Q1 Option 1",
                    },
                    {
                        "question_group": "Question Group 1",
                        "question_group_order": 1,
                        "question_group_leading_question": None,
                        "question": 3,
                        "question_name": "Gender",
                        "question_order": 3,
                        "repeat_index": 0,
                        "comment": "Q3 comment",
                        "is_repeat_identifier": False,
                        "value": "Male",
                    },
                    {
                        "question_group": "Question Group 2",
                        "question_group_order": 2,
                        "question_group_leading_question": None,
                        "question": 4,
                        "question_name": "Age",
                        "question_order": 1,
                        "repeat_index": 0,
                        "comment": "Q4 comment",
                        "is_repeat_identifier": False,
                        "value": 25.0,
                    },
                    {
                        "question_group": "Question Group 1",
                        "question_group_order": 1,
                        "question_group_leading_question": None,
                        "question": 1,
                        "question_name": "Question 1",
                        "question_order": 1,
                        "repeat_index": 1,
                        "comment": None,
                        "is_repeat_identifier": False,
                        "value": "Option 1",
                    },
                    {
                        "question_group": "Question Group 1",
                        "question_group_order": 1,
                        "question_group_leading_question": None,
                        "question": 2,
                        "question_name": "Question 2",
                        "question_order": 2,
                        "repeat_index": 1,
                        "comment": None,
                        "is_repeat_identifier": False,
                        "value": "Test repeat",
                    },
                    {
                        "question_group": "Question Group 1",
                        "question_group_order": 1,
                        "question_group_leading_question": None,
                        "question": 3,
                        "question_name": "Gender",
                        "question_order": 3,
                        "repeat_index": 1,
                        "comment": "Q3 comment 1",
                        "is_repeat_identifier": False,
                        "value": "Female",
                    },
                    {
                        "question_group": "Question Group 2",
                        "question_group_order": 2,
                        "question_group_leading_question": None,
                        "question": 5,
                        "question_name": "Weight",
                        "question_order": 2,
                        "repeat_index": 0,
                        "comment": "Test with zero value",
                        "is_repeat_identifier": False,
                        "value": 0.0,
                    },
                    {
                        "question_group": "Question Group 2",
                        "question_group_order": 2,
                        "question_group_leading_question": None,
                        "question": 6,
                        "question_name": "Cascade",
                        "question_order": 3,
                        "repeat_index": 0,
                        "comment": None,
                        "is_repeat_identifier": False,
                        "value": "Bali|Gianyar",
                    },
                    {
                        "question_group": "Question Group 2",
                        "question_group_order": 2,
                        "question_group_leading_question": None,
                        "question": 7,
                        "question_name": "Nested List",
                        "question_order": 4,
                        "repeat_index": 0,
                        "comment": None,
                        "is_repeat_identifier": False,
                        "value": ["Technology|Programming", "Sports|Football"],
                    },
                    {
                        "question_group": "Question Group 2",
                        "question_group_order": 2,
                        "question_group_leading_question": None,
                        "question": 8,
                        "question_name": "Date",
                        "question_order": 5,
                        "repeat_index": 0,
                        "comment": None,
                        "is_repeat_identifier": False,
                        "value": "2022-01-01",
                    },
                    {
                        "question_group": "Question Group 2",
                        "question_group_order": 2,
                        "question_group_leading_question": None,
                        "question": 9,
                        "question_name": "Multiple Option",
                        "question_order": 6,
                        "repeat_index": 0,
                        "comment": None,
                        "is_repeat_identifier": False,
                        "value": ["MO-1", "MO-2"],
                    },
                ],
                "history": [],
            }
        ]

    @pytest.mark.asyncio
    async def test_get_disabled_form_options(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(
            app.url_path_for("form:get_webform_options"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == [
            {
                "disabled": True,
                "label": "Form Test",
                "value": 1,
                "form_type": "member",
                "enable_prefilled_value": False,
            }
        ]

    @pytest.mark.asyncio
    async def test_update_submitted_data(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get data by id
        res = await client.get(
            app.url_path_for("data:get_by_id", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["id"] == 1
        # update data
        res = await client.put(
            app.url_path_for("data:update", id=1, submitted=1),
            params={"locked_by": 1},
            json=[
                {
                    "question": 5,
                    "repeat_index": 0,
                    "comment": "Q5 comment",
                    "value": 80,
                }
            ],
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 208

    @pytest.mark.asyncio
    async def test_get_webform_from_bucket_with_submitted_values(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        res = await client.get(
            app.url_path_for("form:get_webform_from_bucket", form_id=1),
            params={"data_id": 1},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 208
        # get form data cleaning
        res = await client.get(
            app.url_path_for("form:get_webform_from_bucket", form_id=1),
            params={"data_id": 1, "data_cleaning": True},
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_data_cleaning(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get data by id
        res = await client.get(
            app.url_path_for("data:get_by_id", id=1),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        submitted = res["submitted"]
        submitted_by = res["submitted_by"]
        assert res["id"] == 1
        # update data
        res = await client.put(
            app.url_path_for("data:update", id=1, submitted=0),
            params={"locked_by": 0, "data_cleaning": True},
            json=[
                {
                    "comment": None,
                    "question": 1,
                    "repeat_index": 0,
                    "value": "Option 1",
                },
                {
                    "comment": "This is comment",
                    "question": 2,
                    "repeat_index": 0,
                    "value": "Depend to Q1 Option 1",
                },
                {
                    "question": 3,
                    "repeat_index": 0,
                    "comment": "Q3 comment",
                    "value": "Male",
                },
                {
                    "question": 1,
                    "repeat_index": 1,
                    "comment": None,
                    "value": "Option 1",
                },
                {
                    "question": 2,
                    "repeat_index": 1,
                    "comment": None,
                    "value": "Test repeat",
                },
                {
                    "question": 3,
                    "repeat_index": 1,
                    "comment": "Q3 comment 1",
                    "value": "Female",
                },
                {
                    "question": 4,
                    "repeat_index": 0,
                    "comment": "Q4 comment",
                    "value": 25,
                },
                {
                    "question": 5,
                    "repeat_index": 0,
                    "comment": "Q5 comment data cleaning",
                    "value": 100,
                },
                {
                    "question": 6,
                    "repeat_index": 0,
                    "comment": None,
                    "value": [2, 12],
                },
                {
                    "question": 7,
                    "repeat_index": 0,
                    "comment": None,
                    "value": ["Technology|Programming", "Sports|Football"],
                },
                {
                    "question": 8,
                    "repeat_index": 0,
                    "comment": None,
                    "value": "2022-01-01",
                },
                {
                    "question": 9,
                    "repeat_index": 0,
                    "comment": None,
                    "value": ["MO-1", "MO-2"],
                },
            ],
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res["submitted"] == submitted
        assert res["submitted_by"] == submitted_by
        assert res["answer"] == [
            {
                "comment": None,
                "question": 1,
                "repeat_index": 0,
                "value": "Option 1",
            },
            {
                "comment": "This is comment",
                "question": 2,
                "repeat_index": 0,
                "value": "Depend to Q1 Option 1",
            },
            {
                "question": 3,
                "repeat_index": 0,
                "comment": "Q3 comment",
                "value": "Male",
            },
            {
                "question": 1,
                "repeat_index": 1,
                "comment": None,
                "value": "Option 1",
            },
            {
                "question": 2,
                "repeat_index": 1,
                "comment": None,
                "value": "Test repeat",
            },
            {
                "question": 3,
                "repeat_index": 1,
                "comment": "Q3 comment 1",
                "value": "Female",
            },
            {
                "question": 4,
                "repeat_index": 0,
                "comment": "Q4 comment",
                "value": 25.0,
            },
            {
                "question": 5,
                "repeat_index": 0,
                "comment": "Q5 comment data cleaning",
                "value": 100.0,
            },
            {
                "question": 6,
                "repeat_index": 0,
                "comment": None,
                "value": [2.0, 12.0],
            },
            {
                "question": 7,
                "repeat_index": 0,
                "comment": None,
                "value": ["Technology|Programming", "Sports|Football"],
            },
            {
                "question": 8,
                "repeat_index": 0,
                "comment": None,
                "value": "2022-01-01",
            },
            {
                "question": 9,
                "repeat_index": 0,
                "comment": None,
                "value": ["MO-1", "MO-2"],
            },
        ]
