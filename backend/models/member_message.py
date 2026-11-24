# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing import Optional, List
from typing_extensions import TypedDict
from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    Text,
    ForeignKey,
    UniqueConstraint,
)
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base


class MemberMessageDict(TypedDict):
    id: int
    organisation: int
    year: int
    message: str
    translations: Optional[List[dict]]
    created: datetime
    updated: Optional[datetime]


class MemberMessage(Base):
    __tablename__ = "member_message"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    organisation = Column(
        Integer,
        ForeignKey("organisation.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    year = Column(Integer, nullable=False, index=True)
    message = Column(Text, nullable=False)
    # Preemptive translation column using ISCO standard ARRAY(JSONB)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    created = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "organisation",
            "year",
            name="uq_member_message_org_year",
        ),
    )

    def __init__(
        self,
        organisation: int,
        year: int,
        message: str,
        translations: Optional[List[dict]] = None,
        created: Optional[datetime] = None,
        updated: Optional[datetime] = None,
    ):
        self.organisation = organisation
        self.year = year
        self.message = message
        self.translations = translations
        self.created = created if created is not None else datetime.utcnow()
        self.updated = updated

    @property
    def serialize(self) -> MemberMessageDict:
        return {
            "id": self.id,
            "organisation": self.organisation,
            "year": self.year,
            "message": self.message,
            "translations": self.translations or [],
            "created": self.created,
            "updated": self.updated,
        }
