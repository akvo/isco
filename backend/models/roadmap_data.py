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
from models.user import User, UserDict
from models.organisation import Organisation, OrganisationDict
from models.form import FormInfo


class RoadmapDataPaylod(TypedDict):
    organisation_id: int
    answers: dict
    language: str


class RoadmapDataDict(TypedDict):
    id: int
    name: str
    created: Optional[str] = None
    created_by: str
    organisation: str
    updated: Optional[str] = None
    answer: List[RoadmapAnswerDict]


class RoadmapDataResDict(TypedDict):
    id: int
    organisation_id: int
    organisation: str
    datapoint_name: str
    submitted_date: str


class RoadmapDataResponse(BaseModel):
    current: int
    data: List[RoadmapDataResDict]
    total: int
    total_page: int


class ReportDict(TypedDict):
    id: int
    form: FormInfo
    name: str
    organisation: OrganisationDict
    submitted_by: UserDict
    submitted: Optional[str] = None
    answer: List[RoadmapAnswerDict]


class RoadmapData(Base):
    __tablename__ = "roadmap_data"
    id = Column(Integer,
                primary_key=True,
                index=True,
                nullable=True,
                autoincrement=True)
    name = Column(String)
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
    language = Column(String)

    def __init__(
        self, name: str, created_by: int, organisation: int,
        updated: datetime, created: datetime, language: language
    ):
        self.name = name
        self.created_by = created_by
        self.organisation = organisation
        self.created = created
        self.updated = updated
        self.language = language

    def __repr__(self) -> int:
        return f"<RoadmapData {self.id}>"

    @property
    def serialize(self) -> RoadmapDataDict:
        return {
            "id": self.id,
            "name": self.name,
            "created_by": self.created_by_user.name,
            "organisation": self.organisation_detail.name,
            "created":
            self.created.strftime("%B %d, %Y"),
            "updated":
            self.updated.strftime("%B %d, %Y") if self.updated else None,
            "answer": [a.formatted for a in self.answer],
            "language": self.language,
        }

    @property
    def serializeDatapoint(self) -> RoadmapDataResDict:
        return {
            "id": self.id,
            "organisation_id": self.organisation,
            "organisation": self.organisation_detail.name,
            "datapoint_name": self.name,
            "submitted_date": self.created.strftime("%B %d, %Y"),
        }

    @property
    def to_report(self) -> ReportDict:
        return {
            "id": self.id,
            "name": self.name,
            "form": {
                "id": 1669095326959,
                "name": "Roadmap",
                "description": "Lorem Ipsum Dolor sit Amet",
            },
            "organisation": self.organisation_detail.serialize,
            "submitted_by":
            self.created_by_user.serialize if self.created_by
            else None,
            "submitted":
            self.created.strftime("%B %d, %Y") if self.created else None,
            "answer": [a.to_report for a in self.answer],
        }


class RoadmapDataBase(BaseModel):
    id: int
    name: str
    created_by: str
    organisation: str
    created: Optional[str] = None
    updated: Optional[str] = None
    answer: List[RoadmapAnswerBase]

    class Config:
        orm_mode = True
