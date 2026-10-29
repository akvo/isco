# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db.connection import Base
from models.member_type import MemberType


class MappedMemberTypeDict(TypedDict):
    id: int
    name: str


class PeerGroupPayload(TypedDict):
    name: str
    code: str
    description: Optional[str]


class PeerGroupDict(TypedDict):
    id: int
    name: str
    code: str
    description: Optional[str]
    created: str


class PeerGroupWithMappingsDict(TypedDict):
    id: int
    name: str
    code: str
    description: Optional[str]
    created: str
    member_types: List[MappedMemberTypeDict]


class UpdatePeerGroupMappingsPayload(BaseModel):
    member_type_ids: List[int]


class PeerGroup(Base):
    __tablename__ = "peer_group"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created = Column(DateTime, default=datetime.utcnow)

    member_types = relationship(
        "PeerGroupMemberType",
        backref="peer_group_detail",
        cascade="all, delete-orphan",
    )

    def __init__(
        self,
        name: str,
        code: str,
        description: Optional[str] = None,
        id: Optional[int] = None,
        created: Optional[datetime] = None,
    ):
        self.id = id
        self.name = name
        self.code = code
        self.description = description
        if created:
            self.created = created

    def __repr__(self) -> str:
        return f"<PeerGroup {self.id}: {self.code}>"

    @property
    def serialize_with_mappings(self) -> PeerGroupWithMappingsDict:
        mapped_types: List[MappedMemberTypeDict] = []
        for mt in self.member_types:
            if mt.member_type_detail:
                mapped_types.append(
                    {
                        "id": mt.member_type_detail.id,
                        "name": mt.member_type_detail.name,
                    }
                )
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "created": self.created.strftime("%Y-%m-%d %H:%M:%S")
            if self.created
            else "",
            "member_types": sorted(mapped_types, key=lambda x: x["name"]),
        }

    @property
    def serialize(self) -> PeerGroupDict:
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "created": self.created.strftime("%Y-%m-%d %H:%M:%S")
            if self.created
            else "",
        }


class PeerGroupMemberTypePayload(TypedDict):
    peer_group_id: int
    member_type_id: int
    isco_scope: Optional[str]


class PeerGroupMemberTypeDict(TypedDict):
    id: int
    peer_group_id: int
    member_type_id: int
    isco_scope: str


class PeerGroupMemberType(Base):
    __tablename__ = "peer_group_member_type"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    peer_group_id = Column(
        Integer,
        ForeignKey("peer_group.id", ondelete="CASCADE"),
        nullable=False,
    )
    member_type_id = Column(
        Integer,
        ForeignKey("member_type.id", ondelete="CASCADE"),
        nullable=False,
    )
    isco_scope = Column(String, default="ALL", nullable=False)

    member_type_detail = relationship(
        MemberType,
        backref="peer_group_associations",
    )

    def __init__(
        self,
        peer_group_id: int,
        member_type_id: int,
        isco_scope: str = "ALL",
        id: Optional[int] = None,
    ):
        self.id = id
        self.peer_group_id = peer_group_id
        self.member_type_id = member_type_id
        self.isco_scope = isco_scope

    def __repr__(self) -> str:
        return (
            f"<PeerGroupMemberType {self.id}: "
            f"peer_group={self.peer_group_id}, "
            f"member_type={self.member_type_id}>"
        )

    @property
    def serialize(self) -> PeerGroupMemberTypeDict:
        return {
            "id": self.id,
            "peer_group_id": self.peer_group_id,
            "member_type_id": self.member_type_id,
            "isco_scope": self.isco_scope,
        }


class PeerGroupBase(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        orm_mode = True


class PeerGroupMemberTypeBase(BaseModel):
    id: int
    peer_group_id: int
    member_type_id: int
    isco_scope: str

    class Config:
        orm_mode = True
