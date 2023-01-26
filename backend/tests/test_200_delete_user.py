import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


class TestDeleteUserRoutes():
    @pytest.mark.asyncio
    async def test_delete_user(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        not_super_admin = Acc(email="wayan_invited@test.org", token=None)
        # delete user not super admin
        res = await client.delete(
            app.url_path_for("user:delete", id=3),
            headers={"Authorization": f"Bearer {not_super_admin.token}"})
        assert res.status_code == 403
        # delete user
        res = await client.delete(
            app.url_path_for("user:delete", id=3),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 204
