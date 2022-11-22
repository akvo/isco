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


class TestThirdFormRoutes():
    @pytest.mark.asyncio
    async def test_add_form(self, app: FastAPI, session: Session,
                            client: AsyncClient) -> None:
        # create form
        res = await client.post(
            app.url_path_for("form:create"),
            headers={"Authorization": f"Bearer {account.token}"},
            json={"name": "Third limited survey",
                  "description": "Form Description",
                  "languages": []})
        assert res.status_code == 200
        res = res.json()
        assert res == {"created": datenow(),
                       "description": "Form Description",
                       "id": 3,
                       "languages": [],
                       "name": "Third limited survey",
                       "published": None,
                       "url": None,
                       "version": 0.0}

    @pytest.mark.asyncio
    async def test_get_form_by_id(self, app: FastAPI, session: Session,
                                  client: AsyncClient) -> None:
        # get form
        res = await client.get(app.url_path_for("form:get_by_id", id=3))
        assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_add_default_group(self, app: FastAPI, session: Session,
                                     client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for(
                "question_group:create_default", form_id=3, order=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            'description': None,
            'form': 3,
            'id': 4,
            'isco_access': [],
            'member_access': [],
            'name': 'New section - please change name',
            'order': 1,
            'repeat': False,
            'repeat_text': None,
            'translations': [],
            'question': [{
                'cascade': None,
                'datapoint_name': False,
                'form': 3,
                'id': 12,
                'isco_access': [],
                'mandatory': False,
                'member_access': [],
                'name': 'New question - please change name',
                'option': [],
                'order': 1,
                'personal_data': False,
                'question_group': 4,
                'repeating_objects': [],
                'rule': None,
                'skip_logic': [],
                'tooltip': None,
                'tooltip_translations': [],
                'translations': [],
                'type': 'input',
                'variable_name': None
            }],
        }

    @pytest.mark.asyncio
    async def test_add_default_question(self, app: FastAPI, session: Session,
                                        client: AsyncClient) -> None:
        res = await client.post(
            app.url_path_for(
                "question:create_default",
                form_id=3, question_group_id=4, order=2),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res == {
            'cascade': None,
            'datapoint_name': False,
            'form': 3,
            'id': 13,
            'isco_access': [],
            'mandatory': False,
            'member_access': [],
            'name': 'New question - please change name',
            'option': [],
            'order': 2,
            'personal_data': False,
            'question_group': 4,
            'repeating_objects': [],
            'rule': None,
            'skip_logic': [],
            'tooltip': None,
            'tooltip_translations': [],
            'translations': [],
            'type': 'input',
            'variable_name': None,
        }

    @pytest.mark.asyncio
    async def test_publish_form(self, app: FastAPI, session: Session,
                                client: AsyncClient) -> None:
        # publish form
        res = await client.post(
            app.url_path_for("form:publish"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": 3})
        assert res.status_code == 200
        res = res.json()
        assert res["url"] is not None
        assert res["published"] is not None
