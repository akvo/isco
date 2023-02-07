import sys
import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from tests.test_001_auth import Acc
from sqlalchemy.orm import Session

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)
today = datetime.today().strftime("%B %d, %Y")


class TestSubmissionWithComputedValidationRoutes():
    @pytest.mark.asyncio
    async def test_save_data_with_computed_validation(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        payload = [{
            "question": 14,
            "repeat_index": 0,
            "comment": None,
            "value": 110
        }]
        # direct submit without computed validation
        res = await client.post(
            app.url_path_for("data:create", form_id=4, submitted=1),
            params={"locked_by": 1},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 400
        # save data
        # res = await client.post(
        #     app.url_path_for("data:create", form_id=4, submitted=0),
        #     params={"locked_by": 1},
        #     json=payload,
        #     headers={"Authorization": f"Bearer {account.token}"})
        # assert res.status_code == 400
        # # correct value
        # payload = [{
        #     "question": 14,
        #     "repeat_index": 0,
        #     "comment": None,
        #     "value": 70
        # }, {
        #     "question": 15,
        #     "repeat_index": 0,
        #     "comment": None,
        #     "value": 30
        # }]
        # save data will not validate computed value or core mandatory
        res = await client.post(
            app.url_path_for("data:create", form_id=4, submitted=0),
            params={"locked_by": 1},
            json=payload,
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res['id'] == 6
        # add collaborators
        res = await client.post(
            app.url_path_for("collaborator:create", data=6),
            json=[{"organisation": 2}, {"organisation": 3}],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == [{
            'data': 6, 'id': 3, 'organisation': 2
        }, {
            'data': 6, 'id': 4, 'organisation': 3
        }]

    @pytest.mark.asyncio
    async def test_update_data_with_computed_validation(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get data by id
        res = await client.get(
            app.url_path_for("data:get_by_id", id=6),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        # update data
        # res = await client.put(
        #     app.url_path_for("data:update", id=6, submitted=0),
        #     json=[{
        #         "question": 14,
        #         "repeat_index": 0,
        #         "comment": None,
        #         "value": 35
        #     }, {
        #         "question": 15,
        #         "repeat_index": 0,
        #         "comment": None,
        #         "value": 100
        #     }],
        #     headers={"Authorization": f"Bearer {account.token}"})
        # assert res.status_code == 400
        # update data in save status
        # will not validate computed value or core mandatory
        res = await client.put(
            app.url_path_for("data:update", id=6, submitted=0),
            json=[{
                "question": 14,
                "repeat_index": 0,
                "comment": None,
                "value": 60
            }, {
                "question": 15,
                "repeat_index": 0,
                "comment": None,
                "value": 40
            }],
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        # submit data
        res = await client.put(
            app.url_path_for("data:update", id=6, submitted=1),
            json=[{
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
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
