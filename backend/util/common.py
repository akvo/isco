from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from sqlalchemy.sql.expression import true
from typing import List, Optional
from models.answer import AnswerDict, Answer
from models.question import Question


def get_prev_year(prev: int = 1, year: Optional[bool] = False):
    current = datetime.now()
    previous = timedelta(prev * 365)
    res = current - previous
    if year:
        return res.year
    return res


def generate_datapoint_name(
    session: Session,
    form: int,
    data: Optional[int] = None,
    answers: Optional[List[AnswerDict]] = None
):
    current_answers = answers
    # get question with datapoint name
    questions = session.query(Question).filter(and_(
        Question.form == form,
        Question.datapoint_name == true()
    )).order_by(Question.order).all()
    if not questions:
        # no question set as datapoint
        # return as it is now
        return None
    # get answers from db if no answers send
    if not answers and data:
        qids = [q.id for q in questions]
        current_answers = session.query(Answer).filter(and_(
            Answer.data == data,
            Answer.question.in_(qids)
        )).all()
        current_answers = [ca.formatted for ca in current_answers]
    # generate datapoint_name
    datapoint_names = []
    for q in questions:
        for ca in current_answers:
            if ca.get('question') == q.id:
                datapoint_names.append(str(ca.get('value')))
    datapoint_name = " - ".join(datapoint_names)
    return datapoint_name
