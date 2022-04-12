# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String
from sqlalchemy import Boolean, DateTime
from sqlalchemy.orm import relationship
from db.connection import Base
from models.organisation_isco import OrganisationIsco
from models.organisation_member import OrganisationMember
from datetime import datetime


class OrganisationPayload(TypedDict):
    code: Optional[str] = None
    name: str
    active: Optional[bool] = True
    member_type: Optional[List[int]] = []
    isco_type: Optional[List[int]] = []


class OrganisationDict(TypedDict):
    id: int
    code: Optional[str] = None
    name: str
    active: bool
    member_type: Optional[List[int]] = []
    member: Optional[List[str]] = []
    isco_type: Optional[List[int]] = []
    isco: Optional[List[str]] = []


class Organisation(Base):
    __tablename__ = "organisation"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    code = Column(String, nullable=True)
    name = Column(String)
    active = Column(Boolean)
    created = Column(DateTime, default=datetime.utcnow)
    member_type = relationship(
        OrganisationMember,
        primaryjoin="OrganisationMember.organisation==Organisation.id",
        backref="organisation_member_detail")
    isco_type = relationship(
        OrganisationIsco,
        primaryjoin="OrganisationIsco.organisation==Organisation.id",
        backref="organisation_isco_detail")

    def __init__(self, name: str, code: Optional[str],
                 active: Optional[bool]):
        self.name = name
        self.code = code
        self.active = active

    def __repr__(self) -> int:
        return f"<Organisation {self.id}>"

    @property
    def serialize(self) -> OrganisationDict:
        isco = []
        isco_type = []
        if self.isco_type:
            serialize = [i.serialize for i in self.isco_type]
            isco = [s["isco"] for s in serialize]
            isco_type = [s["isco_type"] for s in serialize]
        member = []
        member_type = []
        if self.member_type:
            serialize = [i.serialize for i in self.member_type]
            member = [s["member"] for s in serialize]
            member_type = [s["member_type"] for s in serialize]
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "active": self.active,
            "isco_type": isco_type,
            "isco": isco,
            "member_type": member_type,
            "member": member,
        }


class OrganisationBase(BaseModel):
    id: int
    code: Optional[str] = None
    name: str
    active: bool
    member_type: Optional[List[int]] = []
    isco_type: Optional[List[int]] = []

    class Config:
        orm_mode = True
