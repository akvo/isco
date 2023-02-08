import os
import json
import requests as r
from fastapi import Depends, Request, APIRouter, Query
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy import and_, extract
from sqlalchemy.orm import Session
from db.connection import get_session
from middleware import verify_user
from models.data import Data, PrevProjectSubmissionResponse
from util.common import get_prev_year, generate_datapoint_name
from db import crud_form, crud_data, crud_collaborator
from pydantic import Required

security = HTTPBearer()
prefilled_route = APIRouter()


@prefilled_route.get(
    "/previous-project-submission/{form_id}",
    response_model=List[PrevProjectSubmissionResponse],
    name="prefilled:get_previous_project_submission",
    summary="get previous submission for project questionnaire \
        and return id of datapoint with datapoint name",
    tags=["Prefilled"])
def get_previous_project_submission(
    req: Request,
    form_id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    user = verify_user(
        session=session, authenticated=req.state.authenticated)
    prev_year = get_prev_year(year=True)
    # get enable_prefilled_value from form
    form = crud_form.get_form_by_id(session=session, id=form_id)
    if not form.enable_prefilled_value:
        return []
    # query for previous year submission
    data = session.query(Data).filter(and_(
        Data.submitted.isnot(None),
        extract('year', Data.submitted) == prev_year,
        Data.organisation == user.organisation,
        Data.form == form.id
    )).all()
    options_value = [d.to_prev_project_submssion_list for d in data]
    for item in options_value:
        if not item.get('is_configured_name'):
            # check and regenerate datapoint/display name
            new_name = generate_datapoint_name(
                session=session,
                form=item.get('form'),
                data=item.get('id'))
            item.update({
                "datapoint_name":
                    new_name if new_name else item.get('datapoint_name')
            })
    return options_value


@prefilled_route.get(
    "/webform/previous-submission/{form_id}",
    response_model=dict,
    name="prefilled:get_webform_with_previous_submission",
    summary="get webform with previous submission value",
    tags=["Prefilled"])
def get_webform_with_previous_submission(
    req: Request,
    form_id: int,
    data_id: int = Query(Required),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    # get enable_prefilled_value from form
    form = crud_form.get_form_by_id(session=session, id=form_id)
    if not form.enable_prefilled_value:
        raise HTTPException(
            status_code=400,
            detail=f"{form.name} questionnaire doesn't \
                have prefilled value enabled.")
    # get form definition
    form = crud_form.get_form_by_id(session=session, id=form_id)
    TESTING = os.environ.get("TESTING")
    if TESTING:
        webform = json.load(open(form.url))
    else:
        webform = r.get(form.url)
        webform = webform.json()
    results = {"form": webform}
    # get prev submission value
    prev_year = get_prev_year(year=True)
    data = crud_data.get_data_by_id(
        session=session, id=data_id,
        submitted=True, prev_year=prev_year)
    initial_values = data.serialize if data else {}
    results.update({"initial_values": initial_values})
    # map the prefilled data with each question inside the new form
    # if there is a mismatch
    # between prefilled answer and the new form add flag True
    question_ids = []
    answer_question_ids = []
    for qg in webform.get('question_group'):
        for q in qg.get('question'):
            question_ids.append(q.get('id'))
    if initial_values:
        answer_question_ids = [
            a.get('question')
            for a in initial_values.get('answer')]
    diff = set(answer_question_ids).difference(set(question_ids))
    results.update({'mismatch': True if diff else False})
    # fetch collaborator
    collaborators = crud_collaborator.get_collaborator_by_data(
        session=session, data=data_id)
    results.update({'collaborators': [c.serialize for c in collaborators]})
    return results
