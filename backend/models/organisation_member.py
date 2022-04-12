# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from db.connection import Base
from models.member_type import MemberType


class OrganisationMemberPayload(TypedDict):
    organisation: Optional[int] = None
    member_type: Optional[int] = None


class OrganisationMemberDict(TypedDict):
    id: int
    organisation: int
    member_type: int
    member: str


class OrganisationMember(Base):
    __tablename__ = "organisation_member"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    organisation = Column(Integer, ForeignKey('organisation.id'))
    member_type = Column(Integer, ForeignKey('member_type.id'))
    member = relationship(MemberType, backref="organisation_member")

    def __init__(self, id: Optional[int],
                 organisation: int, member_type: int):
        self.id = id
        self.organisation = organisation
        self.member_type = member_type

    def __repr__(self) -> int:
        return f"<OrganisationMember {self.id}>"

    @property
    def serialize(self) -> OrganisationMemberDict:
        return {
            "id": self.id,
            "organisation": self.organisation,
            "member_type": self.member_type,
            "member": self.member.name
        }


class OrganisationMemberBase(BaseModel):
    id: int
    organisation: int
    member_type: int

    class Config:
        orm_mode = True
