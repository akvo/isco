# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing_extensions import TypedDict
from typing import List, Optional
from db.connection import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel


class CascadeListPayload(TypedDict):
    cascade: Optional[int] = None
    parent: Optional[int] = None
    code: Optional[str] = None
    name: str
    path: Optional[str] = None
    level: int


class CascadeListDict(TypedDict):
    id: int
    cascade: int
    parent: Optional[int] = None
    code: Optional[str] = None
    name: str
    path: Optional[str] = None
    level: int
    children: Optional[List] = None


class CascadeList(Base):
    __tablename__ = "cascade_list"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    cascade = Column(Integer, ForeignKey('cascade.id'))
    parent = Column(Integer, ForeignKey('cascade_list.id'))
    code = Column(String, nullable=True)
    name = Column(String)
    path = Column(String, nullable=True)
    level = Column(Integer)
    children = relationship("CascadeList")
    parent_detail = relationship("CascadeList", remote_side=[id])
    cascade_detail = relationship("Cascade",
                                  cascade="all, delete",
                                  passive_deletes=True,
                                  backref="cascade_list")

    def __init__(self, cascade: Optional[int], parent: int,
                 code: Optional[str], name: str,
                 path: Optional[str], level: int):
        self.cascade = cascade
        self.parent = parent
        self.code = code
        self.name = name
        self.path = path
        self.level = level

    def __repr__(self) -> int:
        return f"<CascadeList {self.id}>"

    @property
    def serialize(self) -> CascadeListDict:
        return {
            "id": self.id,
            "cascade": self.cascade,
            "parent": self.parent,
            "code": self.code,
            "name": self.name,
            "path": self.path,
            "level": self.level,
            "children": self.children
        }


class CascadeListBase(BaseModel):
    id: int
    cascade: int
    parent: Optional[int] = None
    code: Optional[str] = None
    name: str
    path: Optional[str] = None
    level: int

    class Config:
        orm_mode = True
