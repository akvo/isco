# Please don't use **kwargs
# Keep the code clean and CLEAR

from typing import Optional
from sqlalchemy import Column, ForeignKey
from sqlalchemy import DateTime, Integer, String
import sqlalchemy.dialects.postgresql as pg
from db.connection import Base
from .form import Form
from .data import Data
from .user import User


class Download(Base):
    __tablename__ = "data"
    id = Column(Integer,
                primary_key=True,
                index=True,
                nullable=True,
                autoincrement=True)
    uuid = Column(pg.UUID(as_uuid=True), nullable=True)
    form = Column(Integer, ForeignKey(Form.id))
    data = Column(Integer, ForeignKey(Data.id))
    file = Column(String, nullable=False)
    request_by = Column(Integer, ForeignKey(User.id))
    approved_by = Column(Integer, ForeignKey(User.id), nullable=True)
    created = Column(DateTime, nullable=True)
    expired = Column(DateTime, nullable=True)

    def __init__(self, form: int, data: int, request_by: int,
                 approved_by: Optional[int] = None):
        self.form = form
        self.data = data
        self.file = f"{form}_{data}_{request_by}.html"
        self.request_by = request_by
        self.approved_by = approved_by
