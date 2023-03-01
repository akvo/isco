import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc
import util.storage as storage
from db import crud_data

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)


class TestDeleteFormAndUserWithSubmissionRoutes():
    @pytest.mark.asyncio
    async def test_delete_publish_form(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        form = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert form.status_code == 200
        form = form.json()
        assert form["id"] == 1
        # delete publish form
        res = await client.delete(
            app.url_path_for("form:delete_publish", form_id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 200
        res = res.json()
        assert res["version"] is None
        assert res["url"] is None
        assert res["published"] is None
        assert storage.check(form["url"]) is False

    @pytest.mark.asyncio
    async def test_delete_form_with_submission(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # get form
        form = await client.get(app.url_path_for("form:get_by_id", id=1))
        assert form.status_code == 200
        form = form.json()
        assert form["id"] == 1
        # delete form with submission
        not_super_admin = Acc(email="wayan_invited@test.org", token=None)
        res = await client.delete(
            app.url_path_for("form:delete", id=1),
            headers={"Authorization": f"Bearer {not_super_admin.token}"})
        assert res.status_code == 403
        # check data
        data = crud_data.get_data_by_form(session=session, form=1)
        assert data is not None
        res = await client.delete(
            app.url_path_for("form:delete", id=1),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 400

    @pytest.mark.asyncio
    async def test_delete_user_with_submission(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        not_super_admin = Acc(email="wayan_invited@test.org", token=None)
        # delete user not super admin
        res = await client.delete(
            app.url_path_for("user:delete", id=3),
            headers={"Authorization": f"Bearer {not_super_admin.token}"})
        assert res.status_code == 403
        # delete user with submission
        res = await client.delete(
            app.url_path_for("user:delete", id=2),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 404
