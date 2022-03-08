# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing_extensions import TypedDict
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from db.connection import Base


class MemberTypePayload(TypedDict):
    name: str


class MemberTypeDict(TypedDict):
    id: int
    name: str


class MemberType(Base):
    __tablename__ = "member_type"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)

    def __init__(self, id: Optional[int], name: str):
        self.id = id
        self.name = name

    def __repr__(self) -> int:
        return f"<MemberType {self.id}>"

    @property
    def serialize(self) -> MemberTypeDict:
        return {
            "id": self.id,
            "name": self.name,
        }


class MemberTypeBase(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True
