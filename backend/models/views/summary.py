# Please don't use **kwargs
# Keep the code clean and CLEAR

from sqlalchemy import Boolean, DateTime, Integer, Text, String
from sqlalchemy import Column
from db.connection import Base
import sqlalchemy.dialects.postgresql as pg


class Summary(Base):
    __tablename__ = "summary_view"
    id = Column(Integer, primary_key=True)
    fid = Column(Integer)
    gid = Column(Integer)
    qid = Column(Integer)
    go = Column(Integer)
    qo = Column(Integer)
    repeat_index = Column(Integer)
    question_group = Column(String)
    repeat = Column(Boolean)
    question = Column(String)
    member_type = Column(pg.ARRAY(Integer))
    isco_type = Column(pg.ARRAY(Integer))
    data_id = Column(Integer)
    organisation = Column(String)
    members = Column(String)
    submitted = Column(DateTime)
    answer = Column(Text)

    def __repr__(self) -> int:
        return f"<Summary {self.id}>"

    @property
    def serialize(self):
        return {
            'fid': self.fid,
            'gid': self.gid,
            'qid': self.qid,
            'go': self.go,
            'qo': self.qo,
            'repeat_index': self.repeat_index,
            'question_group': self.question_group,
            'repeat': self.repeat,
            'question': self.question,
            'data_id': self.data_id,
            'organisation': self.organisation,
            'members': self.members,
            'submitted': self.submitted.strftime("%B %d, %Y"),
            'answer': self.answer
        }
