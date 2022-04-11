# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from uuid import uuid4
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String
from sqlalchemy import Enum, DateTime, Text
from sqlalchemy import ForeignKey
from db.connection import Base
from models.organisation import OrganisationDict


class UserRole(enum.Enum):
    secretariat_admin = 'secretariat_admin'
    member_admin = 'member_admin'
    member_user = 'member_user'


class UserInvitation(TypedDict):
    id: int
    name: str
    email: str
    invitation: Optional[str] = None


class UserDict(TypedDict):
    id: int
    organisation: int
    name: str
    email: str
    email_verified: Optional[datetime] = None
    role: UserRole
    invitation: Optional[str] = None


class UserOrgDict(TypedDict):
    id: int
    organisation: OrganisationDict
    name: str
    email: str
    email_verified: Optional[datetime] = None
    role: UserRole
    invitation: Optional[str] = None


class UserSimple(TypedDict):
    email: str
    name: str
    role: UserRole
    email_verified: datetime


class UserRecipient(TypedDict):
    Email: str
    Name: str


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    email = Column(String, unique=True)
    phone_number = Column(String, nullable=True)
    password = Column(String)
    email_verified = Column(DateTime, nullable=True)
    role = Column(Enum(UserRole))
    last_activity = Column(DateTime, nullable=True, default=datetime.utcnow)
    created = Column(DateTime, default=datetime.utcnow)
    organisation = Column(Integer, ForeignKey('organisation.id'))
    invitation = Column(Text, nullable=True)

    def __init__(self, email: str, password: str, name: str, phone_number: str,
                 role: UserRole, organisation: int, invitation: Optional[str]):
        self.email = email
        self.password = password
        self.name = name
        self.phone_number = phone_number
        self.role = role
        self.organisation = organisation
        self.invitation = invitation

    def __repr__(self) -> int:
        return f"<User {self.id}>"

    @property
    def serialize(self) -> UserDict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "email_verified": self.email_verified,
            "organisation": self.organisation,
            "last_activity": self.last_activity,
            "invitation": self.invitation,
        }

    @property
    def recipient(self) -> UserRecipient:
        return {"Email": self.email, "Name": self.name}


class UserBase(BaseModel):
    name: str
    email: str
    phone_number: Optional[str] = None
    password: Optional[str] = str(uuid4())
    role: Optional[UserRole] = UserRole.member_user
    organisation: int
    invitation: Optional[str] = str(uuid4())

    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    current: int
    data: List[UserDict]
    total: int
    total_page: int
