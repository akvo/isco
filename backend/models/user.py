# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from uuid import uuid4
from pydantic import BaseModel, SecretStr
from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy import Enum, DateTime, Text
from sqlalchemy import ForeignKey
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from models.organisation import OrganisationDict
from fastapi import Form


class UserRole(enum.Enum):
    secretariat_admin = 'secretariat_admin'
    member_admin = 'member_admin'
    member_user = 'member_user'


class UserInvitation(TypedDict):
    id: int
    name: str
    email: str
    invitation: Optional[str] = None


class UserUpdateByAdmin(TypedDict):
    organisation: int
    role: UserRole
    questionnaires: Optional[List[int]] = None


class UserDict(TypedDict):
    id: int
    organisation: int
    name: str
    email: str
    email_verified: Optional[datetime] = None
    phone_number: Optional[str] = None
    role: UserRole
    invitation: Optional[str] = None
    questionnaires: Optional[List[int]] = None
    approved: bool


class UserOrgDict(TypedDict):
    id: int
    organisation: OrganisationDict
    name: str
    email: str
    email_verified: Optional[datetime] = None
    phone_number: Optional[str] = None
    role: UserRole
    invitation: Optional[str] = None
    questionnaires: Optional[List[int]] = None
    approved: bool


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
    questionnaires = Column(pg.ARRAY(Integer), nullable=True)
    approved = Column(Boolean, nullable=False, default=False)

    def __init__(self, email: str, password: str, name: str, phone_number: str,
                 role: UserRole, organisation: int, invitation: Optional[str],
                 questionnaires: Optional[List[int]] = None,
                 approved: Optional[bool] = None):
        self.email = email
        self.password = password
        self.name = name
        self.phone_number = phone_number
        self.role = role
        self.organisation = organisation
        self.invitation = invitation
        self.questionnaires = questionnaires
        self.approved = approved

    def __repr__(self) -> int:
        return f"<User {self.id}>"

    @property
    def serialize(self) -> UserDict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone_number": self.phone_number,
            "role": self.role,
            "email_verified": self.email_verified,
            "organisation": self.organisation,
            "last_activity": self.last_activity,
            "invitation": self.invitation,
            "questionnaires": self.questionnaires,
            "approved": self.approved
        }

    @property
    def recipient(self) -> UserRecipient:
        return {"Email": self.email, "Name": self.name}


class UserBase(BaseModel):
    name: str
    email: str
    phone_number: Optional[str] = None
    password: Optional[SecretStr] = str(uuid4())
    role: Optional[UserRole] = UserRole.member_user
    organisation: int
    invitation: Optional[str] = str(uuid4())
    questionnaires: Optional[List[int]] = None
    approved: Optional[bool] = False

    class Config:
        orm_mode = True

    @classmethod
    def as_form(
        cls,
        name: str = Form(...),
        email: str = Form(...),
        password: SecretStr = Form(str(uuid4())),
        phone_number: str = Form(None),
        role: UserRole = Form(UserRole.member_user),
        organisation: int = Form(...),
        # invitation: str = Form(None),
        questionnaires: List[int] = Form([])
    ):
        return cls(
            name=name, email=email, password=password,
            phone_number=phone_number, role=role,
            organisation=organisation,
            # invitation=invitation,
            questionnaires=questionnaires)


class UserResponse(BaseModel):
    current: int
    data: List[UserDict]
    total: int
    total_page: int
