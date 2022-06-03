# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional, List
from pydantic import BaseModel
from pydantic import confloat
from sqlalchemy import Column, ForeignKey
from sqlalchemy import DateTime, Integer, Float, String
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.orm import relationship
from db.connection import Base
from models.answer import AnswerDict, AnswerBase, AnswerDictWithQuestionName
from .form import Form, FormInfo
from .answer import Answer
from .user import User, UserDict
from .organisation import Organisation, OrganisationDict
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY


class GeoData(BaseModel):
    long: confloat(ge=-180.0, le=180.0)
    lat: confloat(ge=-90, le=90)


class ReportDict(TypedDict):
    id: int
    form: FormInfo
    name: str
    organisation: OrganisationDict
    submitted_by: UserDict
    submitted: Optional[str] = None
    answer: List[AnswerDict]

    class Config:
        orm_mode = True


class DataDict(TypedDict):
    id: int
    form: int
    form_name: str
    name: str
    geo: Optional[GeoData] = None
    locked_by: Optional[int] = None
    created: Optional[str] = None
    created_by: str
    organisation: str
    submitted_by: Optional[str] = None
    updated: Optional[str] = None
    submitted: Optional[str] = None
    answer: List[AnswerDict]


class DataDictQuestionName(TypedDict):
    id: int
    form: int
    form_name: str
    name: str
    geo: Optional[GeoData] = None
    created: Optional[str] = None
    organisation: int
    member_type: str
    updated: Optional[str] = None
    submitted: Optional[str] = None
    answer: List[AnswerDictWithQuestionName]


class DataOptionDict(TypedDict):
    id: int
    form: int
    name: str
    organisation: str
    locked_by: Optional[int] = None
    locked_by_user: Optional[str] = None
    created_by: str
    created: Optional[str] = None
    form_type: Optional[str] = None


class DataSubmittedDict(TypedDict):
    id: int
    form: str
    form_type: str
    name: str
    organisation: str
    created_by: str
    created: Optional[str] = None
    submitted_by: str
    submitted: Optional[str] = None

    class Config:
        orm_mode = True


class DataSubmittedResponse(BaseModel):
    current: int
    data: List[DataSubmittedDict]
    total: int
    total_page: int


class SubmissionProgressDict(TypedDict):
    organisation: str
    form: int
    form_type: str
    submitted: bool
    count: int


class DataResponse(BaseModel):
    current: int
    data: List[DataDict]
    total: int
    total_page: int


class DataResponseQuestionName(BaseModel):
    current: int
    data: List[DataDictQuestionName]
    total: int
    total_page: int


class Data(Base):
    __tablename__ = "data"
    id = Column(Integer,
                primary_key=True,
                index=True,
                nullable=True,
                autoincrement=True)
    form = Column(Integer, ForeignKey(Form.id))
    name = Column(String)
    geo = Column(pg.ARRAY(Float), nullable=True)
    locked_by = Column(Integer, ForeignKey(User.id), nullable=True)
    created_by = Column(Integer, ForeignKey(User.id))
    organisation = Column(Integer(), ForeignKey(Organisation.id))
    submitted_by = Column(Integer, ForeignKey(User.id), nullable=True)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    submitted = Column(DateTime, nullable=True)
    answer = relationship(Answer,
                          cascade="all, delete",
                          passive_deletes=True,
                          backref="answer",
                          order_by=Answer.id.asc())
    created_by_user = relationship(User, foreign_keys=[created_by])
    organisation_detail = relationship(Organisation,
                                       foreign_keys=[organisation])
    submitted_by_user = relationship(User, foreign_keys=[submitted_by])
    locked_by_user = relationship(User, foreign_keys=[locked_by])
    form_detail = relationship(Form, foreign_keys=[form])

    def __init__(self, name: str, form: int, geo: List[float], locked_by: int,
                 created_by: int, organisation: int, submitted_by: int,
                 updated: datetime, created: datetime, submitted: datetime):
        self.name = name
        self.form = form
        self.geo = geo
        self.locked_by = locked_by
        self.created_by = created_by
        self.organisation = organisation
        self.submitted_by = submitted_by
        self.created = created
        self.updated = updated
        self.submitted = submitted

    def __repr__(self) -> int:
        return f"<Data {self.id}>"

    @property
    def serialize(self) -> DataDict:
        return {
            "id": self.id,
            "name": self.name,
            "form": self.form,
            "form_name": self.form_detail.name,
            "geo": {
                "lat": self.geo[0],
                "long": self.geo[1]
            } if self.geo else None,
            "locked_by": self.locked_by,
            "created_by": self.created_by_user.name,
            "organisation": self.organisation_detail.name,
            "submitted_by":
            self.submitted_by_user.name if self.submitted_by else None,
            "created":
            self.created.strftime("%B %d, %Y"),
            "updated":
            self.updated.strftime("%B %d, %Y") if self.updated else None,
            "submitted":
            self.submitted.strftime("%B %d, %Y") if self.submitted else None,
            "answer": [a.formatted for a in self.answer],
        }

    @property
    def serializeWithQuestionName(self) -> DataDictQuestionName:
        member_type = self.organisation_detail.member_type
        member_type = [x.serialize for x in member_type]
        member_type = [s["member"] for s in member_type]
        member_type = ", ".join(member_type)
        return {
            "id": self.id,
            "name": self.name,
            "form": self.form,
            "form_name": self.form_detail.name,
            "geo": {
                "lat": self.geo[0],
                "long": self.geo[1]
            } if self.geo else None,
            "organisation": self.organisation,
            "member_type": member_type,
            "created":
            self.created.strftime("%B %d, %Y"),
            "updated":
            self.updated.strftime("%B %d, %Y") if self.updated else None,
            "submitted":
            self.submitted.strftime("%B %d, %Y") if self.submitted else None,
            "answer": [a.formattedWithQuestionName for a in self.answer],
        }

    @property
    def to_data_frame(self):
        data = {
            "id":
            self.id,
            "datapoint_name":
            self.name,
            "geolocation":
            f"{self.geo[0], self.geo[1]}" if self.geo else None,
            "locked_by":
            self.locked_by,
            "created_by":
            self.created_by_user.name,
            "organisation":
            self.organisation_detail.name,
            "submitted_by":
            self.submitted_by_user.name if self.submitted_by else None,
            "created_at":
            self.created.strftime("%B %d, %Y"),
            "updated_at":
            self.updated.strftime("%B %d, %Y") if self.updated else None,
            "submitted_at":
            self.submitted.strftime("%B %d, %Y") if self.submitted else None,
        }
        for a in self.answer:
            data.update(a.to_data_frame)
        return data

    @property
    def to_options(self) -> DataOptionDict:
        form = self.form_detail.name
        organisation = self.organisation_detail.name
        created_by = self.created_by_user.name
        created = self.created.strftime("%B %d, %Y")
        name = f"{form} - {organisation} - {created_by} - {created}"
        if self.name:
            name = self.name
        form_type = None
        if self.form in MEMBER_SURVEY:
            form_type = "member"
        if self.form in PROJECT_SURVEY:
            form_type = "project"
        return {
            "id": self.id,
            "name": name,
            "form": self.form,
            "form_type": form_type,
            "locked_by": self.locked_by,
            "locked_by_user": self.locked_by_user.name
            if self.locked_by_user else None,
            "organisation": organisation,
            "created_by": created_by,
            "created": created,
        }

    @property
    def simplified(self) -> DataSubmittedDict:
        created = self.created.strftime("%B %d, %Y")
        submitted = self.submitted.strftime("%B %d, %Y")
        form_type = None
        if self.form in MEMBER_SURVEY:
            form_type = "member"
        if self.form in PROJECT_SURVEY:
            form_type = "project"
        return {
            "id": self.id,
            "name": self.name,
            "form": self.form_detail.name,
            "form_type": form_type,
            "organisation": self.organisation_detail.name,
            "created_by": self.created_by_user.name,
            "created": created,
            "submitted_by": self.submitted_by_user.name,
            "submitted": submitted,
        }

    @property
    def to_report(self) -> ReportDict:
        return {
            "id": self.id,
            "name": self.name,
            "form": self.form_detail.info,
            "organisation": self.organisation_detail.serialize,
            "submitted_by": self.submitted_by_user.serialize,
            "submitted":
            self.submitted.strftime("%B %d, %Y") if self.submitted else None,
            "answer": [a.to_report for a in self.answer],
        }


class DataBase(BaseModel):
    id: int
    form: int
    name: str
    geo: Optional[GeoData] = None
    locked_by: Optional[int] = None
    created_by: str
    organisation: str
    submitted_by: Optional[str] = None
    created: Optional[str] = None
    updated: Optional[str] = None
    submitted: Optional[str] = None
    answer: List[AnswerBase]

    class Config:
        orm_mode = True
