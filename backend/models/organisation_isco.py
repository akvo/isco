# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from db.connection import Base
from models.isco_type import IscoType


class OrganisationIscoPayload(TypedDict):
    organisation: Optional[int] = None
    isco_type: Optional[int] = None


class OrganisationIscoDict(TypedDict):
    id: int
    organisation: int
    isco_type: int
    isco: str


class OrganisationIsco(Base):
    __tablename__ = "organisation_isco"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    organisation = Column(Integer, ForeignKey('organisation.id'))
    isco_type = Column(Integer, ForeignKey('isco_type.id'))
    isco = relationship(IscoType, backref="organisation_isco")

    def __init__(self, id: Optional[int],
                 organisation: int, isco_type: int):
        self.id = id
        self.organisation = organisation
        self.isco_type = isco_type

    def __repr__(self) -> int:
        return f"<OrganisationIsco {self.id}>"

    @property
    def serialize(self) -> OrganisationIscoDict:
        return {
            "id": self.id,
            "organisation": self.organisation,
            "isco_type": self.isco_type,
            "isco": self.isco.name
        }


class OrganisationIscoBase(BaseModel):
    id: int
    organisation: int
    isco_type: int

    class Config:
        orm_mode = True
