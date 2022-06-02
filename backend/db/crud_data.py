from datetime import datetime
from typing import List, Optional, Union
from typing_extensions import TypedDict
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, null
from models.data import Data, DataDict, DataOptionDict
from models.answer import Answer
from models.answer import AnswerBase
from models.organisation_isco import OrganisationIsco
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY
from util.survey_config import LIMITED_SURVEY
from util.survey_config import MEMBER_SURVEY_UNLIMITED_ISCO


class PaginatedData(TypedDict):
    data: List[DataDict]
    count: int


def add_data(session: Session,
             name: str,
             form: int,
             locked_by: int,
             created_by: int,
             organisation: int,
             answers: List[AnswerBase],
             submitted: Optional[int] = 0,
             geo: Optional[List[float]] = None) -> DataDict:
    submitted_by = None
    submitted_date = None
    updated = None
    if submitted:
        submitted_by = created_by
        submitted_date = datetime.now()
        updated = datetime.now()
    data = Data(name=name,
                form=form,
                geo=geo,
                locked_by=locked_by,
                created_by=created_by,
                organisation=organisation,
                submitted_by=submitted_by,
                created=datetime.now(),
                updated=updated,
                submitted=submitted_date)
    for answer in answers:
        data.answer.append(answer)
    session.add(data)
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def update_data(session: Session, data: Data) -> DataDict:
    session.commit()
    session.flush()
    session.refresh(data)
    return data


def delete_by_id(session: Session, id: int) -> None:
    session.query(Answer).filter(Answer.data == id).delete()
    session.query(Data).filter(Data.id == id).delete()
    session.commit()


def delete_bulk(session: Session, ids: List[int]) -> None:
    session.query(Answer).filter(
        Answer.data.in_(ids)).delete(synchronize_session='fetch')
    session.query(Data).filter(
        Data.id.in_(ids)).delete(synchronize_session='fetch')
    session.commit()


def get_data(session: Session, form: int, skip: int,
             perpage: int, submitted: Optional[bool] = False,
             org_ids: Optional[List[int]] = None) -> PaginatedData:
    data = session.query(Data).filter(Data.form == form)
    if submitted:
        data = data.filter(Data.submitted != null())
    if org_ids:
        data = data.filter(Data.organisation.in_(org_ids))
    count = data.count()
    data = data.order_by(desc(Data.id)).offset(skip).limit(perpage).all()
    return PaginatedData(data=data, count=count)


def get_data_by_id(session: Session,
                   id: int,
                   submitted: Optional[bool] = None) -> DataDict:
    data = session.query(Data).filter(Data.id == id)
    if submitted is None:
        return data.first()
    if submitted:
        data = data.filter(Data.submitted != null())
    else:
        data = data.filter(Data.submitted == null())
    return data.first()


def get_data_by_ids(session: Session, ids: List[int]) -> List[DataOptionDict]:
    data = session.query(Data).filter(
        and_(Data.id.in_(ids), Data.submitted == null())).all()
    return data


def get_data_by_organisation(
        session: Session,
        organisation: int,
        submitted: bool = False,
        page: Union[int, bool] = False,
        page_size: Union[int, bool] = False) -> List[DataOptionDict]:
    data = session.query(Data).filter(
        and_(
            Data.organisation == organisation, Data.submitted == null()
            if not submitted else Data.submitted.isnot(None)))
    if page is False or page_size is False:
        return data.all()
    return data.limit(page_size).offset((page - 1) * page_size)


def count(session: Session, form: int) -> int:
    data = session.query(Data).filter(Data.form == form).count()
    return data


def count_data_by_organisation(
        session: Session,
        organisation: int,
        submitted: bool = False) -> int:
    data = session.query(Data).filter(
        and_(
            Data.organisation == organisation, Data.submitted == null()
            if not submitted else Data.submitted.isnot(None)))
    return data.count()


def download(session: Session, form: int):
    data = session.query(Data).filter(Data.form == form).order_by(desc(
        Data.id)).all()
    return [d.to_data_frame for d in data]


def check_member_submission_exists(session: Session,
                                   organisation: int,
                                   form: Optional[int] = None,
                                   saved: Optional[bool] = False):
    # handle unlimited project questionnaire
    if form and form in PROJECT_SURVEY:
        return False
    # handle limited member questionnaire or limited survey
    if form and form in MEMBER_SURVEY:
        # handle unlimited member questionnaire
        # for organisation ISCO contains DISCO
        check_org = session.query(OrganisationIsco).filter(and_(
            OrganisationIsco.organisation == organisation,
            OrganisationIsco.isco_type.in_(
                MEMBER_SURVEY_UNLIMITED_ISCO))).first()
        if check_org:
            return False
        form_config = MEMBER_SURVEY
    if form and form in LIMITED_SURVEY:
        form_config = LIMITED_SURVEY
    data = session.query(Data).filter(and_(
        Data.form.in_(form_config),
        Data.organisation == organisation))
    # filter by not submitted
    if saved:
        data = data.filter(Data.submitted == null())
        if not data.all():
            return False
        return False if data.count() == 1 else True
    data = data.count()
    return data > 0
