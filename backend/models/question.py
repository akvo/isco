# Please don't use **kwargs
# Keep the code clean and CLEAR

import enum
from db.connection import Base
from pydantic import BaseModel
from typing import Optional, List
from typing_extensions import TypedDict
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy import Boolean, Enum, ForeignKey
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import relationship, backref
from models.skip_logic import SkipLogicBase, SkipLogicPayload
from models.option import OptionBase, OptionPayload, OptionJson
import sqlalchemy.dialects.postgresql as pg
from datetime import datetime


class QuestionType(enum.Enum):
    input = "input"
    text = "text"
    number = "number"
    option = "option"
    multiple_option = "multiple_option"
    date = "date"
    nested_list = "nested_list"
    cascade = "cascade"
    autofield = "autofield"


class RuleDict(TypedDict):
    allow_other: Optional[bool] = None
    allow_negative: Optional[bool] = None
    allow_decimal: Optional[bool] = None
    min: Optional[int] = None
    max: Optional[int] = None
    allowNA: Optional[bool] = None


class RepeatingObjectType(enum.Enum):
    unit = "unit"
    indicator = "indicator"


class RepeatingObjectDict(TypedDict):
    field: RepeatingObjectType
    value: str


class QuestionDeactivatePayload(TypedDict):
    id: int
    deactivate: bool


class QuestionPayload(TypedDict):
    form: Optional[int] = None
    question_group: Optional[int] = None
    name: str
    translations: Optional[List[dict]] = None
    mandatory: bool
    core_mandatory: bool
    deactivate: bool
    datapoint_name: bool
    variable_name: Optional[str] = None
    type: QuestionType
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = None
    cascade: Optional[int] = None
    repeating_objects: Optional[List[dict]] = None
    order: Optional[int] = None
    option: Optional[List[OptionPayload]] = None
    member_access: Optional[List[int]] = None
    isco_access: Optional[List[int]] = None
    skip_logic: Optional[List[SkipLogicPayload]] = None
    autofield: Optional[dict] = None
    is_repeat_identifier: Optional[bool] = False
    show_as_textarea: Optional[bool] = False


class QuestionDict(TypedDict):
    id: int
    form: int
    question_group: int
    name: str
    translations: Optional[List[dict]] = []
    mandatory: bool
    datapoint_name: bool
    variable_name: Optional[str] = None
    type: QuestionType
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = []
    cascade: Optional[int] = None
    repeating_objects: Optional[List] = []
    order: Optional[int] = None
    autofield: Optional[dict] = None
    is_repeat_identifier: Optional[bool] = False
    show_as_textarea: Optional[bool] = False


class Question(Base):
    __tablename__ = "question"
    id = Column(Integer, primary_key=True, index=True, nullable=True)
    form = Column(Integer, ForeignKey("form.id"))
    question_group = Column(Integer, ForeignKey("question_group.id"))
    name = Column(String)
    translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    mandatory = Column(Boolean, default=True)
    core_mandatory = Column(Boolean, default=False)
    deactivate = Column(Boolean, default=False)
    datapoint_name = Column(Boolean, default=False)
    variable_name = Column(String, nullable=True, unique=True)
    type = Column(Enum(QuestionType), default=QuestionType.input)
    personal_data = Column(Boolean, default=False)
    rule = Column(MutableDict.as_mutable(pg.JSONB), nullable=True)
    tooltip = Column(String, nullable=True)
    tooltip_translations = Column(pg.ARRAY(pg.JSONB), nullable=True)
    cascade = Column(Integer, ForeignKey("cascade.id"), nullable=True)
    repeating_objects = Column(pg.ARRAY(pg.JSONB), nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    order = Column(Integer, nullable=True)
    autofield = Column(MutableDict.as_mutable(pg.JSONB), nullable=True)
    is_repeat_identifier = Column(Boolean, default=False)
    show_as_textarea = Column(Boolean, default=False)
    member_access = relationship(
        "QuestionMemberAccess",
        primaryjoin="QuestionMemberAccess.question==Question.id",
        cascade="all, delete",
        passive_deletes=True,
        backref="question_member_access",
    )
    isco_access = relationship(
        "QuestionIscoAccess",
        primaryjoin="QuestionIscoAccess.question==Question.id",
        cascade="all, delete",
        passive_deletes=True,
        backref="question_isco_access",
    )
    option = relationship(
        "Option",
        primaryjoin="Option.question==Question.id",
        cascade="all, delete",
        passive_deletes=True,
        backref="question_option",
    )
    skip_logic = relationship(
        "SkipLogic",
        primaryjoin="SkipLogic.question==Question.id",
        backref="question_skip_logic",
    )
    cascades = relationship(
        "Cascade", backref=backref("question", uselist=False)
    )

    def __init__(
        self,
        id: Optional[int],
        name: str,
        form: int,
        question_group: int,
        translations: Optional[List[dict]],
        mandatory: Optional[bool],
        datapoint_name: Optional[bool],
        variable_name: Optional[str],
        type: QuestionType,
        personal_data: Optional[bool],
        rule: Optional[dict],
        tooltip: Optional[str],
        cascade: Optional[int],
        tooltip_translations: Optional[List[dict]],
        repeating_objects: Optional[List],
        order: Optional[int],
        core_mandatory: Optional[bool],
        deactivate: Optional[bool],
        autofield: Optional[dict],
        is_repeat_identifier: Optional[bool] = False,
        show_as_textarea: Optional[bool] = False,
    ):
        self.id = id
        self.form = form
        self.question_group = question_group
        self.name = name
        self.translations = translations
        self.mandatory = mandatory
        self.datapoint_name = datapoint_name
        self.variable_name = variable_name
        self.type = type
        self.personal_data = personal_data
        self.rule = rule
        self.tooltip = tooltip
        self.tooltip_translations = tooltip_translations
        self.cascade = cascade
        self.repeating_objects = repeating_objects
        self.order = order
        self.core_mandatory = core_mandatory
        self.deactivate = deactivate
        self.autofield = autofield
        self.is_repeat_identifier = is_repeat_identifier
        self.show_as_textarea = show_as_textarea

    def __repr__(self) -> int:
        return f"<Question {self.id}>"

    @property
    def only_id(self) -> int:
        return self.id

    @property
    def serialize(self) -> QuestionDict:
        translations = []
        if self.translations:
            translations = self.translations

        tooltip_translations = []
        if self.tooltip_translations:
            tooltip_translations = self.tooltip_translations

        repeating_objects = []
        if self.repeating_objects:
            repeating_objects = self.repeating_objects

        return {
            "id": self.id,
            "form": self.form,
            "question_group": self.question_group,
            "name": self.name,
            "translations": translations,
            "mandatory": self.mandatory,
            "datapoint_name": self.datapoint_name,
            "variable_name": self.variable_name,
            "type": self.type,
            "personal_data": self.personal_data,
            "rule": self.rule,
            "tooltip": self.tooltip,
            "tooltip_translations": tooltip_translations,
            "member_access": [ma.member_type for ma in self.member_access],
            "isco_access": [ia.isco_type for ia in self.isco_access],
            "cascade": self.cascade,
            "repeating_objects": repeating_objects,
            "option": [opt.serialize for opt in self.option],
            "skip_logic": [skip.serialize for skip in self.skip_logic],
            "order": self.order,
            "core_mandatory": self.core_mandatory,
            "deactivate": self.deactivate,
            "autofield": self.autofield,
            "is_repeat_identifier": self.is_repeat_identifier,
            "show_as_textarea": self.show_as_textarea,
        }

    @property
    def serializeJson(self):
        group_detail = self.question_group_detail
        group_member = [ma.memberName for ma in group_detail.member_access]
        group_isco = [ia.iscoName for ia in group_detail.isco_access]
        # inherit group member/isco access if question member/isco []
        question_member = group_member
        if self.member_access:
            question_member = [ma.memberName for ma in self.member_access]
        question_isco = group_isco
        if self.isco_access:
            question_isco = [ia.iscoName for ia in self.isco_access]
        question = {
            "id": self.id,
            "name": self.name,
            "required": self.mandatory,
            "datapoint_name": self.datapoint_name,
            "type": self.type.value,
            "order": self.order,
            "member_access": question_member,
            "isco_access": question_isco,
            "coreMandatory": self.core_mandatory,
            "deactivate": self.deactivate,
            "is_repeat_identifier": self.is_repeat_identifier,
        }
        if self.rule:
            if "allow_other" not in self.rule:
                question.update({"rule": self.rule})
            if "allow_decimal" in self.rule:
                question.get("rule").update({"allowDecimal": True})
            if "allow_other" in self.rule:
                question.update({"allowOther": self.rule["allow_other"]})
                question.update({"allowOtherText": "Other"})
        if self.personal_data:
            question.update({"personal_data": self.personal_data})
        if self.variable_name:
            question.update({"variable_name": self.variable_name})
        if self.cascade:
            question.update({"cascade": self.cascade})
        if self.translations:
            question.update({"translations": self.translations})
        if self.option:
            question.update(
                {"option": [opt.serializeJson for opt in self.option]}
            )
        if self.repeating_objects:
            question.update({"repeating_objects": self.repeating_objects})
        if self.tooltip:
            tooltip = {"text": self.tooltip}
            if self.tooltip_translations:
                temp = []
                for t in self.tooltip_translations:
                    temp.append(
                        {
                            "language": t["language"],
                            "text": t["tooltip_translations"],
                        }
                    )
                tooltip.update({"translations": temp})
            question.update({"tooltip": tooltip})
        if self.skip_logic:
            question.update(
                {
                    "dependency": [
                        skip.serializeJson for skip in self.skip_logic
                    ]
                }
            )
        if self.autofield:
            question.update({"fn": self.autofield})
        # add question group id lead by the question
        if self.leads_group:
            question.update(
                {"lead_repeat_group": [lead.id for lead in self.leads_group]}
            )
        if self.type == QuestionType.input:
            question.update({"show_as_textarea": self.show_as_textarea})
        return question


class QuestionBase(BaseModel):
    id: int
    form: int
    question_group: int
    name: str
    translations: Optional[List[dict]] = []
    mandatory: bool
    core_mandatory: bool
    deactivate: bool
    datapoint_name: bool
    variable_name: Optional[str] = None
    type: QuestionType
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[str] = None
    tooltip_translations: Optional[List[dict]] = []
    member_access: Optional[List[int]] = []
    isco_access: Optional[List[int]] = []
    cascade: Optional[int] = None
    repeating_objects: Optional[List] = []
    option: Optional[List[OptionBase]] = []
    skip_logic: Optional[List[SkipLogicBase]] = []
    order: Optional[int] = None
    disableDelete: Optional[bool] = False
    autofield: Optional[dict] = None
    is_repeat_identifier: Optional[bool] = False
    show_as_textarea: Optional[bool] = False

    class Config:
        orm_mode = True


class QuestionJson(BaseModel):
    id: int
    name: str
    translations: Optional[List[dict]] = []
    required: bool
    core_mandatory: bool
    deactivate: bool
    order: Optional[int] = None
    datapoint_name: bool
    variable_name: Optional[str] = None
    type: QuestionType
    personal_data: bool
    rule: Optional[dict] = None
    tooltip: Optional[dict] = None
    cascade: Optional[int] = None
    repeating_objects: Optional[List] = []
    option: Optional[List[OptionJson]] = []
    dependency: Optional[List[dict]] = []
    fn: Optional[dict] = None
    lead_repeat_group: Optional[int] = None
    is_repeat_identifier: Optional[bool] = False
    show_as_textarea: Optional[bool] = False

    class Config:
        orm_mode = True
