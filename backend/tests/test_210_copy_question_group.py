import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime
from tests.test_000_main import Acc

from models.question_group import QuestionGroup
from models.question import Question

pytestmark = pytest.mark.asyncio
sys.path.append("..")

account = Acc(email=None, token=None)


def datenow():
    now = datetime.utcnow()
    return now.strftime("%d-%m-%Y")


def print_check(session, status):
    print(f"{status} ===============================")
    groups = (
        session.query(QuestionGroup)
        .filter(QuestionGroup.form == 1)
        .order_by(QuestionGroup.order)
        .all()
    )
    for g in groups:
        print("G", g, g.order, g.member_access, g.isco_access)
        questions = (
            session.query(Question)
            .filter(Question.question_group == g.id)
            .order_by(Question.order)
            .all()
        )
        for q in questions:
            print("Q", q, q.order, q.member_access, q.isco_access)
    print(f"END OF {status} ===============================\n\n")


class TestCopyGroupAndQuestion:
    @pytest.mark.asyncio
    async def test_copy_question_group_after(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # first copy
        res = await client.post(
            app.url_path_for(
                "question_group:copy", id=1, selected_order=1, target_order=3
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204
        # print_check(session=session, status="AFTER #1")
        # second copy
        res = await client.post(
            app.url_path_for(
                "question_group:copy", id=1, selected_order=1, target_order=3
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204
        # print_check(session=session, status="AFTER #2")
        # third copy
        res = await client.post(
            app.url_path_for(
                "question_group:copy", id=1, selected_order=1, target_order=6
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204
        print_check(session=session, status="AFTER #3")

    @pytest.mark.asyncio
    async def test_copy_question_group_before(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        # first copy
        res = await client.post(
            app.url_path_for(
                "question_group:copy", id=2, selected_order=4, target_order=1
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204
        print_check(session=session, status="BEFORE #1")
        # second copy
        res = await client.post(
            app.url_path_for(
                "question_group:copy", id=2, selected_order=5, target_order=3
            ),
            headers={"Authorization": f"Bearer {account.token}"},
        )
        assert res.status_code == 204
        print_check(session=session, status="BEFORE #2")
