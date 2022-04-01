# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing_extensions import TypedDict
from typing import Optional, List
from pydantic import BaseModel
from pydantic import confloat
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.orm import relationship
from db.connection import Base
from models.answer import AnswerDict, AnswerBase
from .form import Form
from .answer import Answer


class GeoData(BaseModel):
    long: confloat(ge=-180.0, le=180.0)
    lat: confloat(ge=-90, le=90)


class DataDict(TypedDict):
    id: int
    form: int
    name: str
    geo: Optional[GeoData] = None
    created: Optional[str] = None
    updated: Optional[str] = None
    submitted: Optional[str] = None
    answer: List[AnswerDict]


class DataResponse(BaseModel):
    current: int
    data: List[DataDict]
    total: int
    total_page: int


class Data(Base):
    __tablename__ = "data"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey(Form.id))
    name = Column(String)
    geo = Column(pg.ARRAY(Float), nullable=True)
    created = Column(DateTime, nullable=True)
    updated = Column(DateTime, nullable=True)
    submitted = Column(DateTime, nullable=True)
    answer = relationship(Answer,
                          cascade="all, delete",
                          passive_deletes=True,
                          backref="answer",
                          order_by=Answer.id.asc())

    def __init__(self, name: str, form: int, geo: List[float],
                 updated: datetime, created: datetime, submitted: datetime):
        self.name = name
        self.form = form
        self.geo = geo
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
            "geo": {
                "lat": self.geo[0],
                "long": self.geo[1]
            } if self.geo else None,
            "created": self.created.strftime("%B %d, %Y"),
            "updated":
            self.updated.strftime("%B %d, %Y") if self.updated else None,
            "submitted":
            self.submitted.strftime("%B %d, %Y") if self.submitted else None,
            "answer": [a.formatted for a in self.answer],
        }

    @property
    def to_data_frame(self):
        data = {
            "id":
            self.id,
            "datapoint_name": self.name,
            "geolocation":
            f"{self.geo[0], self.geo[1]}" if self.geo else None,
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


class DataBase(BaseModel):
    id: int
    form: int
    name: str
    geo: Optional[GeoData] = None
    created: Optional[str] = None
    updated: Optional[str] = None
    submitted: Optional[str] = None
    answer: List[AnswerBase]

    class Config:
        orm_mode = True
