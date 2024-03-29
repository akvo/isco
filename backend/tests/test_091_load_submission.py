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


class TestLoadSubmission:
    @pytest.mark.asyncio
    async def test_submission_progress(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        not_super_admin = Acc(email="wayan_invited@test.org", token=None)
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {not_super_admin.token}"},
        )
        assert res.status_code == 403
        # super admin
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == [
            {
                "organisation": "staff Akvo",
                "form": 1,
                "form_type": "member",
                "submitted": True,
                "count": 1,
            }
        ]
        # super admin filter by form_id
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": [1]},
        )
        assert res.status_code == 200
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"form_id": [1000]},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == []
        # super admin filter by organisation but not in same isco
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"organisation": [3]},
        )
        assert res.status_code == 403
        # super admin filter by organisation in same isco
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"organisation": [1]},
        )
        assert res.status_code == 200
        res = res.json()
        assert res[0]["organisation"] == "staff Akvo"
        # super admin filter by organisation in same isco and form_id
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"organisation": [1], "form_id": [1]},
        )
        assert res.status_code == 200
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"organisation": [1], "form_id": [1000]},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == []
        # filters organisations that has not "submitted" any questionnaire
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"not_submitted": True},
        )
        assert res.status_code == 200
        # filters by organisation which doesn't have data
        res = await client.get(
            app.url_path_for("submission:progress"),
            headers={"Authorization": f"Bearer {account.token}"},
            params={"organisation": [2], "not_submitted": 1},
        )
        assert res.status_code == 200
        res = res.json()
        assert res == []
