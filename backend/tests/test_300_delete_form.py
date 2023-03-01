import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc
from models.question_group import QuestionGroup
from models.question import Question

pytestmark = pytest.mark.asyncio
sys.path.append("..")
account = Acc(email=None, token=None)


class TestClearFormSubmissionAndDeleteForm():
    @pytest.mark.asyncio
    async def test_delete_form(
        self, app: FastAPI, session: Session, client: AsyncClient
    ) -> None:
        form_id = 1
        # delete form
        res = await client.delete(
            app.url_path_for("form:delete", id=form_id),
            headers={"Authorization": f"Bearer {account.token}"})
        assert res.status_code == 204
        # check form already deleted
        form = await client.get(
            app.url_path_for("form:get_by_id", id=form_id))
        assert form.status_code == 404
        group = session.query(QuestionGroup).filter(
            QuestionGroup.form == form_id).count()
        assert group == 0
        question = session.query(Question).filter(
            Question.form == form_id).count()
        assert question == 0
