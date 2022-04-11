# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy import ForeignKey
from db.connection import Base


class FeedbackCategory(enum.Enum):
    questionnaire = 'questionnaire'
    tool = 'tool'
    other = 'other'


class FeedbackPayload(TypedDict):
    title: str
    category: str
    content: str


class FeedbackDict(TypedDict):
    id: int
    user: int
    title: str
    category: str
    content: str


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    user = Column(Integer, ForeignKey('user.id'))
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created = Column(DateTime, nullable=True)

    def __init__(self, id: Optional[int], user: int, title: str,
                 category: str, content: str, created: datetime):
        self.id = id
        self.user = user
        self.title = title
        self.category = category
        self.content = content
        self.created = created

    def __repr__(self) -> int:
        return f"<Feedback {self.id}>"

    @property
    def serialize(self) -> FeedbackDict:
        return {
            "id": self.id,
            "user": self.user,
            "title": self.title,
            "category": self.category,
            "content": self.content,
        }


class FeedbackBase(BaseModel):
    id: int
    user: int
    title: str
    category: str
    content: str

    class Config:
        orm_mode = True
