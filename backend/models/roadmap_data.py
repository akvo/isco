# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import relationship
from db.connection import Base
from models.roadmap_answer import RoadmapAnswerDict, RoadmapAnswerBase
from models.roadmap_answer import RoadmapAnswer
from models.user import User
from models.organisation import Organisation


class RoadmapDataPaylod(TypedDict):
    organisation_id: int
    answers: dict


class RoadmapDataDict(TypedDict):
    id: int
    name: str
    reporting_year: int
    created: Optional[str] = None
    created_by: str
    organisation: str
    updated: Optional[str] = None
    answer: List[RoadmapAnswerDict]


class RoadmapData(Base):
    __tablename__ = "roadmap_data"
    id = Column(Integer,
                primary_key=True,
                index=True,
                nullable=True,
                autoincrement=True)
    name = Column(String)
    reporting_year = Column(Integer)
    created_by = Column(Integer, ForeignKey(User.id))
    organisation = Column(Integer(), ForeignKey(Organisation.id))
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    answer = relationship(
        RoadmapAnswer, cascade="all, delete", passive_deletes=True,
        backref="roadmap_answer", order_by=RoadmapAnswer.id.asc())
    created_by_user = relationship(User, foreign_keys=[created_by])
    organisation_detail = relationship(
        Organisation, foreign_keys=[organisation])

    def __init__(
        self, name: str, created_by: int, organisation: int,
        updated: datetime, created: datetime, reporting_year: Optional[int]
    ):
        self.name = name
        self.reporting_year = reporting_year
        self.created_by = created_by
        self.organisation = organisation
        self.created = created
        self.updated = updated

    def __repr__(self) -> int:
        return f"<RoadmapData {self.id}>"

    @property
    def serialize(self) -> RoadmapDataDict:
        return {
            "id": self.id,
            "name": self.name,
            "reporting_year": self.reporting_year,
            "created_by": self.created_by_user.name,
            "organisation": self.organisation_detail.name,
            "created":
            self.created.strftime("%B %d, %Y"),
            "updated":
            self.updated.strftime("%B %d, %Y") if self.updated else None,
            "answer": [a.formatted for a in self.answer],
        }


class RoadmapDataBase(BaseModel):
    id: int
    name: str
    reporting_year: int
    created_by: str
    organisation: str
    created: Optional[str] = None
    updated: Optional[str] = None
    answer: List[RoadmapAnswerBase]

    class Config:
        orm_mode = True
