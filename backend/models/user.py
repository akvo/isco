# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, Boolean, String
from sqlalchemy import Enum, DateTime
from sqlalchemy import ForeignKey
from db.connection import Base


class UserRole(enum.Enum):
    secretariat_admin = 'secretariat_admin'
    member_admin = 'member_admin'
    member_user = 'member_user'


class UserDict(TypedDict):
    id: int
    organisation: int
    name: str
    email: str
    active: bool
    role: UserRole


class UserSimple(TypedDict):
    email: str
    name: str
    role: UserRole
    active: bool


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
    active = Column(Boolean, nullable=True, default=False)
    role = Column(Enum(UserRole))
    last_activity = Column(DateTime, default=datetime.utcnow)
    organisation = Column(Integer, ForeignKey('organisation.id'))

    def __init__(self, email: str, name: str, role: UserRole, active: bool,
                 organisation: int):
        self.email = email
        self.name = name
        self.active = active
        self.role = role
        self.organisation = organisation

    def __repr__(self) -> int:
        return f"<User {self.id}>"

    @property
    def serialize(self) -> UserDict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "active": self.active,
            "organisation": self.organisation,
            "last_activity": self.last_activity
        }

    @property
    def recipient(self) -> UserRecipient:
        return {
            "Email": self.email,
            "Name": self.name
        }


class UserBase(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    active: Optional[bool] = False
    email_verified: Optional[bool] = False
    organisation: int

    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    current: int
    data: List[UserBase]
    total: int
    total_page: int
