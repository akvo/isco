import os
from datetime import datetime
from typing import List, Optional, Union
from typing_extensions import TypedDict
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_, null, extract
from models.data import Data, DataDict, DataOptionDict
from models.answer import Answer
from models.answer import AnswerBase
from models.organisation_isco import OrganisationIsco
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY
from util.survey_config import LIMITED_SURVEY
from util.survey_config import MEMBER_SURVEY_UNLIMITED_ISCO
from util.common import get_prev_year


class PaginatedData(TypedDict):
    data: List[DataDict]
    count: int


def add_data(
    session: Session,
    name: str,
    form: int,
    locked_by: int,
    created_by: int,
    organisation: int,
    answers: List[AnswerBase],
    submitted: Optional[int] = 0,
    geo: Optional[List[float]] = None,
) -> DataDict:
    submitted_by = None
    submitted_date = None
    updated = None
    if submitted:
        submitted_by = created_by
        submitted_date = datetime.now()
        updated = datetime.now()
    data = Data(
        name=name,
        form=form,
        geo=geo,
        locked_by=locked_by,
        created_by=created_by,
        organisation=organisation,
        submitted_by=submitted_by,
        created=datetime.now(),
        updated=updated,
        submitted=submitted_date,
    )
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
    session.query(Answer).filter(Answer.data.in_(ids)).delete(
        synchronize_session="fetch"
    )
    session.query(Data).filter(Data.id.in_(ids)).delete(
        synchronize_session="fetch"
    )
    session.commit()


def get_data(
    session: Session,
    skip: int,
    perpage: int,
    form: Optional[Union[int, str]] = None,
    submitted: Optional[bool] = False,
    org_ids: Optional[List[int]] = None,
    monitoring_round: Optional[int] = None,
    data_id: Optional[int] = None,
) -> PaginatedData:
    data = session.query(Data)
    if form and form != "all":
        data = data.filter(Data.form == form)
    if data_id:
        data = data.filter(Data.id == data_id)
    if submitted:
        data = data.filter(Data.submitted != null())
    if org_ids:
        data = data.filter(Data.organisation.in_(org_ids))
    if monitoring_round:
        # On selecting a year , increment it by 1 and
        # then fetch all records where createdAt is for that year
        monitoring_round = monitoring_round
        data = data.filter(extract("year", Data.created) == monitoring_round)
    count = data.count()
    data = data.order_by(desc(Data.id)).offset(skip).limit(perpage).all()
    return PaginatedData(data=data, count=count)


def get_data_by_id(
    session: Session,
    id: int,
    submitted: Optional[bool] = None,
    prev_year: Optional[int] = None,
) -> DataDict:
    data = session.query(Data).filter(Data.id == id)
    if prev_year:
        data = data.filter(extract("year", Data.submitted) == prev_year)
    if submitted is None:
        return data.first()
    if submitted:
        data = data.filter(Data.submitted != null())
    else:
        data = data.filter(Data.submitted == null())
    return data.first()


def get_data_by_ids(session: Session, ids: List[int]) -> List[DataOptionDict]:
    data = (
        session.query(Data)
        .filter(and_(Data.id.in_(ids), Data.submitted == null()))
        .all()
    )
    return data


def get_data_by_organisation(
    session: Session,
    organisation: int,
    submitted: Optional[bool] = None,
    page: Union[int, bool] = False,
    page_size: Union[int, bool] = False,
) -> List[DataOptionDict]:
    data = session.query(Data).filter((Data.organisation == organisation))
    if submitted:
        data = data.filter(Data.submitted.isnot(None))
    if submitted is not None and not submitted:
        data = data.filter(Data.submitted == null())
    if page is False or page_size is False:
        return data.all()
    return data.limit(page_size).offset((page - 1) * page_size)


def count(session: Session, form: int) -> int:
    data = session.query(Data).filter(Data.form == form).count()
    return data


def count_data_by_organisation(
    session: Session, organisation: int, submitted: bool = False
) -> int:
    data = session.query(Data).filter(
        and_(
            Data.organisation == organisation,
            (
                Data.submitted == null()
                if not submitted
                else Data.submitted.isnot(None)
            ),
        )
    )
    return data.count()


def download(session: Session, form: int):
    data = (
        session.query(Data)
        .filter(Data.form == form)
        .order_by(desc(Data.id))
        .all()
    )
    return [d.to_data_frame for d in data]


def check_member_submission_exists(
    session: Session,
    organisation: int,
    form: Optional[int] = None,
    saved: Optional[bool] = False,
):
    TESTING = os.environ.get("TESTING")
    current_year = get_prev_year(prev=0, year=True)
    # handle unlimited project questionnaire
    if form and form in PROJECT_SURVEY:
        return False
    # handle limited member questionnaire or limited survey
    form_config = []
    if form and form in MEMBER_SURVEY:
        if TESTING:
            # ## FOR 2022 MONITORING ROUND ## #
            # handle unlimited member questionnaire
            # for organisation ISCO contains DISCO
            check_org = (
                session.query(OrganisationIsco)
                .filter(
                    and_(
                        OrganisationIsco.organisation == organisation,
                        OrganisationIsco.isco_type.in_(
                            MEMBER_SURVEY_UNLIMITED_ISCO
                        ),
                    )
                )
                .first()
            )
            if check_org:
                return False
        form_config = MEMBER_SURVEY
    if form and form in LIMITED_SURVEY:
        # intersection between form and limited survey config
        form_config = list(set([form]) & set(LIMITED_SURVEY))
    data = (
        session.query(Data)
        .filter(
            and_(Data.form.in_(form_config), Data.organisation == organisation)
        )
        .filter(
            or_(
                extract("year", Data.created) == current_year,
                extract("year", Data.submitted) == current_year,
            )
        )
    )
    # filter by not submitted
    if saved:
        data = data.filter(Data.submitted == null())
        if not data.all():
            return False
        return False if data.count() == 1 else True
    data = data.count()
    return data > 0


def get_data_by_form(session: Session, form: int):
    data = session.query(Data).filter(Data.form == form).all()
    return data


def get_history_datapoint(
    session: Session,
    data_id: int,
    organisation_id: int,
    last_year: int,
    submitted: datetime,
    form: Optional[Union[int, str]] = None,
):
    """Query the history data for submitted datapoint"""
    data = session.query(Data)
    data = data.filter(
        and_(
            Data.id != data_id,
            ~Data.form.in_(PROJECT_SURVEY),
        )
    )
    if form and form != "all":
        data = data.filter(
            Data.form == form,
        )
    data = (
        data.filter(
            and_(
                Data.organisation == organisation_id,
                Data.submitted != null(),
            )
        )
        .filter(
            or_(
                Data.submitted != submitted,
                extract("year", Data.submitted) != last_year,
            )
        )
        .all()
    )
    return data
