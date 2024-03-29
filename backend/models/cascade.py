# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from typing_extensions import TypedDict
from typing import List, Optional
from db.connection import Base
from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from models.cascade_list import CascadeListBase
from models.cascade_list import CascadeListPayload


class CascadeType(enum.Enum):
    cascade = 'cascade'
    nested = 'nested'


class CascadePayload(TypedDict):
    name: str
    type: CascadeType
    cascades: Optional[List[CascadeListPayload]] = None


class CascadeDict(TypedDict):
    id: int
    name: str
    type: CascadeType


class Cascade(Base):
    __tablename__ = "cascade"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    name = Column(String)
    type = Column(Enum(CascadeType), nullable=False)
    cascades = relationship("CascadeList",
                            cascade="all, delete",
                            passive_deletes=True,
                            backref="cascade_detail")

    def __init__(self, id: Optional[int], name: str, type: CascadeType):
        self.id = id
        self.name = name
        self.type = type

    def __repr__(self) -> int:
        return f"<Cascade {self.id}>"

    @property
    def serialize(self) -> CascadeDict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "cascades": [c.serialize for c in self.cascades]
        }


class CascadeBase(BaseModel):
    id: int
    name: str
    type: CascadeType
    cascades: List[CascadeListBase]

    class Config:
        orm_mode = True
