# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional, List
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, ForeignKey, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from db.connection import Base
from models.user import UserBase
from models.organisation_isco import OrganisationIscoBase
from datetime import datetime


class OrganisationPayload(TypedDict):
    parent: Optional[int] = None
    code: Optional[str] = None
    name: str
    level: int
    active: Optional[bool] = True


class OrganisationDict(TypedDict):
    id: int
    parent: Optional[int] = None
    code: Optional[str] = None
    name: str
    level: int
    active: bool
    children: Optional[List] = []
    users: List[UserBase]
    isco_type: Optional[List[OrganisationIscoBase]] = None


class Organisation(Base):
    __tablename__ = "organisation"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    parent = Column(Integer, ForeignKey('organisation.id'), nullable=True)
    code = Column(String, nullable=True)
    name = Column(String)
    level = Column(Integer)
    active = Column(Boolean)
    created = Column(DateTime, default=datetime.utcnow)
    children = relationship("Organisation")
    parent_detail = relationship("Organisation", remote_side=[id])
    users = relationship(
        "User",
        primaryjoin="User.organisation==Organisation.id",
        backref="organisation_detail")
    isco_type = relationship(
        "OrganisationIsco",
        primaryjoin="OrganisationIsco.organisation==Organisation.id",
        backref="organisation_isco_detail")

    def __init__(self, parent: int, name: str):
        self.parent = parent
        self.name = name

    def __repr__(self) -> int:
        return f"<Organisation {self.id}>"

    @property
    def serialize(self) -> OrganisationDict:
        return {
            "id": self.id,
            "parent": self.parent,
            "code": self.code,
            "name": self.name,
            "level": self.level,
            "active": self.active,
            "children": self.children,
            "users": self.users
        }

    @property
    def with_parent_name(self):
        return {
            "id": self.id,
            "parent": self.parent_detail.name if self.parent_detail else None,
            "code": self.code,
            "name": self.name,
            "level": self.level,
            "active": self.active
        }

    @property
    def simplify_serialize_with_children(self):
        return {
            "id": self.id,
            "children": [c.id for c in self.children]
        }


class OrganisationBase(BaseModel):
    id: int
    parent: Optional[int] = None
    code: Optional[str] = None
    name: str
    level: int
    active: Optional[bool] = True

    class Config:
        orm_mode = True


class OrganisationResponse(OrganisationBase):
    children: List[OrganisationBase]
