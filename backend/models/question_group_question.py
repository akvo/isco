# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing_extensions import TypedDict
from pydantic import BaseModel
from sqlalchemy import Column, Integer, ForeignKey
from db.connection import Base


class QuestionGroupQuestionDict(TypedDict):
    id: int
    form: int
    question_group: int
    question: int


class QuestionGroupQuestion(Base):
    __tablename__ = "question_group_question"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey('form.id'))
    question_group = Column(Integer, ForeignKey('question_group.id'))
    question = Column(Integer, ForeignKey('question.id'))

    def __init__(self, form: int, question_group: int, question: int):
        self.form = form
        self.question_group = question_group
        self.question = question

    def __repr__(self) -> int:
        return f"<QuestionGroupQuestion {self.id}>"

    @property
    def serialize(self) -> QuestionGroupQuestionDict:
        return {
            "id": self.id,
            "form": self.form,
            "question_group": self.question_group,
            "question": self.question
        }


class QuestionGroupQuestionBase(BaseModel):
    id: int
    form: int
    question_group: int
    question: int

    class Config:
        orm_mode = True
