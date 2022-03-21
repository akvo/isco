# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String
from sqlalchemy import ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship, backref
from db.connection import Base
from models.user import UserBase
from models.organisation_isco import OrganisationIscoBase
from models.organisation_isco import OrganisationIscoPayload
from datetime import datetime


class OrganisationPayload(TypedDict):
    code: Optional[str] = None
    name: str
    active: Optional[bool] = True
    member_type: int
    isco_type: Optional[List[OrganisationIscoPayload]] = []


class OrganisationDict(TypedDict):
    id: int
    code: Optional[str] = None
    name: str
    active: bool
    member_type: int


class Organisation(Base):
    __tablename__ = "organisation"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    code = Column(String, nullable=True)
    name = Column(String)
    active = Column(Boolean)
    created = Column(DateTime, default=datetime.utcnow)
    member_type = Column(Integer, ForeignKey('member_type.id'))
    users = relationship(
        "User",
        primaryjoin="User.organisation==Organisation.id",
        backref="organisation_detail")
    isco_type = relationship(
        "OrganisationIsco",
        primaryjoin="OrganisationIsco.organisation==Organisation.id",
        backref="organisation_isco_detail")
    member = relationship(
        "MemberType",
        backref=backref("organisation", uselist=False))

    def __init__(self, name: str, code: Optional[str],
                 active: Optional[bool], member_type: int):
        self.name = name
        self.code = code
        self.active = active
        self.member_type = member_type

    def __repr__(self) -> int:
        return f"<Organisation {self.id}>"

    @property
    def serialize(self) -> OrganisationDict:
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "active": self.active,
            "users": self.users,
            "isco_type": self.isco_type,
            "member_type": self.member_type
        }


class OrganisationBase(BaseModel):
    id: int
    code: Optional[str] = None
    name: str
    active: bool
    member_type: int
    users: Optional[List[UserBase]] = []
    isco_type: Optional[List[OrganisationIscoBase]] = []

    class Config:
        orm_mode = True
