# Please don't use **kwargs
# Keep the code clean and CLEAR

from datetime import datetime
from typing import Optional
from typing_extensions import TypedDict
from sqlalchemy import Column, ForeignKey
from sqlalchemy import DateTime, Integer, String
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.orm import relationship
from db.connection import Base
from .form import Form
from .data import Data
from .user import User


class DownloadDict(TypedDict):
    id: int
    form: int
    name: str
    request_by: Optional[int] = None
    created: Optional[str] = None
    created_by: str
    approved_by: str
    created: Optional[str] = None
    expired: Optional[str] = None


class Download(Base):
    __tablename__ = "download"
    id = Column(Integer,
                primary_key=True,
                index=True,
                nullable=True,
                autoincrement=True)
    uuid = Column(
        pg.UUID,
        nullable=True,
        server_default='(md5(random()::text || clock_timestamp()::text)::uuid)'
    ),
    form = Column(Integer, ForeignKey(Form.id))
    data = Column(Integer, ForeignKey(Data.id))
    file = Column(String, nullable=False)
    request_by = Column(Integer, ForeignKey(User.id))
    approved_by = Column(Integer, ForeignKey(User.id), nullable=True)
    created = Column(DateTime, nullable=True)
    expired = Column(DateTime, nullable=True)
    request_by_user = relationship(User, foreign_keys=[request_by])
    approved_by_user = relationship(User, foreign_keys=[approved_by])

    def __init__(self,
                 form: int,
                 data: int,
                 request_by: int,
                 file: str,
                 approved_by: Optional[int] = None,
                 expired: Optional[datetime] = None):
        self.form = form
        self.data = data
        self.file = file
        self.request_by = request_by
        self.approved_by = approved_by
        self.expired = expired

    def __repr__(self) -> int:
        return f"<Download {self.id}>"

    @property
    def serialize(self) -> DownloadDict:
        return {
            "id": self.id,
            "uuid": self.uuid,
            "form": self.form,
            "data": self.data,
            "file": self.file,
            "request_by": self.created_by_user.name,
            "approved_by": self.approved_by_user.name,
            "created": self.created.strftime("%B %d, %Y"),
            "expired": self.expired.strftime("%B %d, %Y"),
            "answer": [a.formatted for a in self.answer],
        }
