# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import ForeignKey
from db.connection import Base


class CollaboratorPayload(TypedDict):
    organisation: int


class CollaboratorDict(TypedDict):
    id: int
    data: int
    organisation: int


class Collaborator(Base):
    __tablename__ = "collaborator"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    data = Column(Integer, ForeignKey('data.id'))
    organisation = Column(Integer, ForeignKey('organisation.id'))

    def __init__(self, id: Optional[int], data: int, organisation: int):
        self.id = id
        self.data = data
        self.organisation = organisation

    def __repr__(self) -> int:
        return f"<Collaborator {self.id}>"

    @property
    def serialize(self) -> CollaboratorDict:
        return {
            "id": self.id,
            "data": self.data,
            "organisation": self.organisation,
        }


class CollaboratorBase(BaseModel):
    id: int
    data: int
    organisation: int

    class Config:
        orm_mode = True
