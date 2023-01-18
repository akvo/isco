import sys
import pytest
import db.crud_answer as crud_answer
import db.crud_data as crud_data
import db.crud_question as crud_question
from sqlalchemy.orm import Session
from models.answer import Answer
from models.data import Data
from datetime import datetime

pytestmark = pytest.mark.asyncio
sys.path.append("..")

answers = [{
    "comment": None,
    "question": 1,
    "repeat_index": 0,
    "value": "Option 1"
}, {
    "comment": "This is comment",
    "question": 2,
    "repeat_index": 0,
    "value": "Depend to Q1 Option 1"
}, {
    "question": 3,
    "repeat_index": 0,
    "comment": "Q3 comment",
    "value": "Male"
}, {
    "question": 4,
    "repeat_index": 0,
    "comment": "Q4 comment",
    "value": 25
}, {
    "question": 5,
    "repeat_index": 0,
    "comment": "Q5 comment",
    "value": 75
}, {
    "question": 6,
    "repeat_index": 0,
    "comment": None,
    "value": [2, 12]
}, {
    "question": 7,
    "repeat_index": 0,
    "comment": None,
    "value": ["Technology|Programming", "Sports|Football"]
}, {
    "question": 8,
    "repeat_index": 0,
    "comment": None,
    "value": "2022-01-01"
}, {
    "question": 9,
    "repeat_index": 0,
    "comment": None,
    "value": ["MO-1", "MO-2"]
}]
answer_list = []


class TestAnswerAppendValueFunction():
    @pytest.mark.asyncio
    async def test_append_value(self, session: Session) -> None:
        for a in answers:
            question = crud_question.get_question_by_id(
                session=session, id=a['question'])
            answer = Answer(question=a["question"],
                            data=1,
                            created=datetime.now(),
                            repeat_index=a["repeat_index"],
                            comment=a["comment"])
            answer = crud_answer.append_value(
                answer=answer, value=a['value'], type=question.type)
            answer_list.append(answer)
            res = answer.serialize
            assert res['question'] == a['question']

    @pytest.mark.asyncio
    async def test_add_update_answer(self, session: Session) -> None:
        data = crud_data.add_data(
            session=session,
            name="test to truncate",
            form=1,
            locked_by=1,
            created_by=1,
            organisation=1,
            answers=answer_list)
        # delete old answer
        session.query(Answer).filter(Answer.data == data.id).delete()
        for a in answers:
            question = crud_question.get_question_by_id(
                session=session, id=a['question'])
            answer = Answer(question=a["question"],
                            data=data.id,
                            created=datetime.now(),
                            repeat_index=a["repeat_index"],
                            comment=a["comment"])
            answer = crud_answer.add_answer(
                session=session, answer=answer,
                type=question.type, value=a['value'])
            assert answer.id
            updated = crud_answer.update_answer(
                session=session, answer=answer,
                type=question.type, value=a['value'],
                repeat_index=a['repeat_index'],
                comment=f"updated {a['comment']}")
            assert answer.id == updated.id
        # get data
        res = crud_data.get_data(
            session=session, form=1, skip=1, perpage=5,
            submitted=True, org_ids=[1])
        assert "data" in res
        assert "count" in res
        res = crud_data.get_data_by_id(
            session=session, id=data.id)
        assert res.id == data.id
        res = crud_data.get_data_by_id(
            session=session, id=data.id, submitted=True)
        assert res is None
        res = crud_data.get_data_by_id(
            session=session, id=data.id, submitted=False)
        assert res.id == data.id
        res = crud_data.get_data_by_ids(session=session, ids=[data.id])
        assert len(res) > 0
        res = crud_data.get_data_by_organisation(
            session=session, organisation=1, submitted=False)
        assert len(res) > 0
        res = crud_data.count(session=session, form=1)
        assert res == 4
        res = crud_data.count_data_by_organisation(
            session=session, organisation=1)
        assert res == 1
        # update data
        data.name = "updated data"
        updated = crud_data.update_data(session=session, data=data)
        assert updated.name == data.name
        # delete
        crud_data.delete_by_id(session=session, id=data.id)
        data = session.query(Data).filter(Data.id == data.id).first()
        assert data is None

    @pytest.mark.asyncio
    async def test_downnload_and_check_exist_data(self,
                                                  session: Session) -> None:
        download = crud_data.download(session=session, form=1)
        assert len(download) > 0
        check = crud_data.check_member_submission_exists(
            session=session, organisation=1)
        assert check is False
        check = crud_data.check_member_submission_exists(
            session=session, organisation=1, form=1)
        assert check is True

    @pytest.mark.asyncio
    async def test_data_bulk_delete(self, session: Session) -> None:
        data = session.query(Data).all()
        crud_data.delete_bulk(session=session, ids=[d.id for d in data])
        data = crud_data.get_data(session=session, form=1, skip=1, perpage=5)
        assert len(data["data"]) == 0
        assert data["count"] == 0
