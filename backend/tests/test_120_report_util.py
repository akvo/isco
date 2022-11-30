import sys
import pytest
import util.report as report
import db.crud_data as crud_data
from sqlalchemy.orm import Session
from models.question import Question, QuestionType
from models.answer import Answer

pytestmark = pytest.mark.asyncio
sys.path.append("..")


class TestReportUtil():
    @pytest.mark.asyncio
    async def test_get_cascade_value(self, session: Session) -> None:
        question = session.query(Question).filter(
            Question.type == QuestionType.cascade.value).first()
        answer = session.query(Answer).filter(
            Answer.question == question.id).first()
        data = crud_data.get_data_by_id(session=session, id=answer.data)
        if not data:
            assert True is True
        data = data.to_report
        data = report.get_cascade_value(data=data, session=session)
        assert "answer" in data
        for a in data['answer']:
            if a['question_type'] == QuestionType.cascade and \
               a['name'] == question.name:
                assert a['value'] == "Bali - Gianyar"

    @pytest.mark.asyncio
    async def test_transform_data(self, session: Session) -> None:
        data = crud_data.get_data_by_id(session=session, id=1)
        if not data:
            assert True is True
        data = data.to_report
        data = report.get_cascade_value(data=data, session=session)
        detail = report.transform_data(answers=data["answer"], session=session)
        assert len(detail) > 0
        assert "data" in detail[0]
        assert len(detail[0]["data"]) > 0
        assert "repeat" in detail[0]["data"][0]
        assert "answers" in detail[0]["data"][0]
        assert list(detail[0]["data"][0]["answers"][0]) == [
            'question', 'value', 'value_type', 'tooltip', 'comment']

    @pytest.mark.asyncio
    async def test_generate_report_html(self, session: Session) -> None:
        data = crud_data.get_data_by_id(session=session, id=1)
        if not data:
            assert True is True
        data = data.to_report
        data = report.get_cascade_value(data=data, session=session)
        detail = report.transform_data(answers=data["answer"], session=session)
        file = report.generate(data=data, detail=detail)
        assert ".html" in file
