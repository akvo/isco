# Please don't use **kwargs
# Keep the code clean and CLEAR

from uuid import uuid4
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy import DateTime
from db.connection import Base
from models.user import User, UserInvitation
from datetime import datetime, timedelta


class ResetPasswordBase(BaseModel):
    id: int
    user: UserInvitation
    url: str
    valid: datetime
    expired: bool

    class Config:
        orm_mode = True


class ResetPassword(Base):
    __tablename__ = "reset_password"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    user = Column(Integer, ForeignKey(User.id), nullable=False)
    url = Column(String, nullable=False)
    valid = Column(DateTime)

    def __init__(self, user: int):
        self.user = user
        self.url = str(uuid4())
        self.valid = datetime.utcnow() + timedelta(minutes=20)

    def __repr__(self) -> str:
        return f"<ResetPassword {self.id}>"

    @property
    def serialize(self) -> ResetPasswordBase:
        return {
            "id": self.id,
            "user": self.user,
            "url": self.url,
            "valid": self.valid,
            "expired": self.valid < datetime.utcnow()
        }
