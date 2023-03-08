# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
import uuid
from datetime import datetime
from typing import Optional, List
from typing_extensions import TypedDict
from sqlalchemy import Column, ForeignKey
from sqlalchemy import DateTime, Integer, String, Enum
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.connection import Base
from pydantic import BaseModel
from .user import User
from .form import FormType
from .organisation import Organisation


class DownloadResponse(TypedDict):
    id: int
    form_type: Optional[FormType] = None
    data: int
    organisation: int


class DownloadStatusType(enum.Enum):
    approved = 'approved'
    pending = 'pending'
    rejected = 'rejected'
    expired = 'expired'


class DownloadDict(TypedDict):
    id: int
    form_type: Optional[FormType] = None
    name: str
    organisation: int
    request_by: Optional[int] = None
    created: Optional[str] = None
    created_by: str
    approved_by: str
    created: Optional[str] = None
    expired: Optional[datetime] = None


class DataDownloadDict(TypedDict):
    id: int
    uuid: Optional[str] = None
    form: str
    form_type: Optional[FormType] = None
    name: str
    organisation: str
    created_by: str
    created: Optional[str] = None
    submitted_by: Optional[str] = None
    submitted: Optional[str] = None
    status: Optional[DownloadStatusType] = None
    expired: Optional[datetime] = None


class DownloadRequestedDict(TypedDict):
    id: int
    uuid: str
    organisation: str
    form_type: Optional[FormType] = None
    request_by: int
    request_by_name: str
    request_date: str
    status: str


class DownloadRequestedResponse(BaseModel):
    current: int
    data: List[DownloadRequestedDict]
    total: int
    total_page: int


class Download(Base):
    __tablename__ = "download"
    id = Column(Integer,
                primary_key=True,
                index=True,
                nullable=True,
                autoincrement=True)
    uuid = Column(pg.UUID(as_uuid=True),
                  nullable=True,
                  default=str(uuid.uuid4()))
    form_type = Column(Enum(FormType), nullable=True)
    data = Column(Integer, nullable=False)
    organisation = Column(Integer, ForeignKey(Organisation.id))
    file = Column(String, nullable=False)
    request_by = Column(Integer, ForeignKey(User.id))
    approved_by = Column(Integer, ForeignKey(User.id), nullable=True)
    created = Column(DateTime, nullable=True, server_default=func.now())
    expired = Column(DateTime, nullable=True)
    request_by_user = relationship(User, foreign_keys=[request_by])
    approved_by_user = relationship(User, foreign_keys=[approved_by])
    organisation_detail = relationship(Organisation,
                                       foreign_keys=[organisation])

    def __init__(self,
                 uuid: str,
                 data: int,
                 organisation: int,
                 request_by: int,
                 file: str,
                 form_type: Optional[FormType] = None,
                 approved_by: Optional[int] = None,
                 expired: Optional[datetime] = None):
        self.form_type = form_type
        self.uuid = uuid
        self.data = data
        self.organisation = organisation
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
            "form_type": self.form_type,
            "data": self.data,
            "organisation": self.organisation,
            "file": self.file,
            "request_by": self.created_by_user.name,
            "approved_by": self.approved_by_user.name,
            "created": self.created.strftime("%B %d, %Y"),
            "expired": self.expired,
            "answer": [a.formatted for a in self.answer],
        }

    @property
    def response(self) -> DownloadResponse:
        return {
            "id": self.id,
            "form_type": self.form_type,
            "data": self.data,
            "organisation": self.organisation,
        }

    @property
    def list_of_download_request(self) -> DownloadRequestedDict:
        status = DownloadStatusType.pending.value
        if self.approved_by and self.expired:
            status = DownloadStatusType.approved.value
        if self.approved_by and not self.expired:
            status = DownloadStatusType.rejected.value
        return {
            "id": self.id,
            "uuid": str(self.uuid),
            "organisation": self.organisation_detail.name,
            "form_type": self.form_type,
            "request_by": self.request_by,
            "request_by_name": self.request_by_user.name,
            "request_date": self.created.strftime("%B %d, %Y"),
            "status": status
        }

    @property
    def saved_download_request(self) -> DownloadRequestedDict:
        return {
            "request_by": self.request_by,
            "request_by_name": self.request_by_user.name,
            "request_date": self.created.strftime("%B %d, %Y"),
        }

    @property
    def check_download_list(self):
        status = None
        if self.uuid:
            status = DownloadStatusType.pending.value
        if self.approved_by and self.expired:
            status = DownloadStatusType.approved.value
        if self.approved_by and not self.expired:
            status = DownloadStatusType.rejected.value
        if self.expired and datetime.utcnow() > self.expired:
            status = DownloadStatusType.expired.value
        return {
            "uuid": str(self.uuid) if self.uuid else None,
            "expired": self.expired,
            "status": status
        }
