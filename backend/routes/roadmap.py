import os
import json
from datetime import datetime
from http import HTTPStatus
# from pydantic import Required
from typing import Optional
from fastapi import Depends, Request, APIRouter, status
from fastapi import HTTPException, Query, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from db.connection import get_session
from db import crud_roadmap
from db import crud_organisation
from models.roadmap_question_group import RoadmapFormJson
from models.roadmap_data import RoadmapDataPaylod, RoadmapData
from middleware import verify_admin

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_file = "./source/roadmap.json"

security = HTTPBearer()
roadmap_route = APIRouter()


@roadmap_route.get(
    "/roadmap-webform/",
    response_model=RoadmapFormJson,
    summary="get roadmap report form",
    name="roadmap:get_webform",
    tags=["Roadmap"])
def get(
    req: Request,
    data_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    verify_admin(
        session=session, authenticated=req.state.authenticated)
    # get roadmap form
    f = open(source_file)
    try:
        roadmap_webform = json.load(f)
    except FileNotFoundError:
        roadmap_webform = {}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap form not found")
    question_groups = crud_roadmap.get_roadmap_question_group(
        session=session)
    question_group = [qg.serializeJson for qg in question_groups]
    # TODO:: Get initial value when receive data_id query param
    roadmap_webform.update({
        "languages": None,
        "version": 1,
        "tree": None,
        "question_group": question_group
    })
    return roadmap_webform


@roadmap_route.post(
    "/roadmap-webform",
    status_code=HTTPStatus.NO_CONTENT,
    summary="post roadmap report datapoint",
    name="roadmap:post_datapoint",
    tags=["Roadmap"])
def post(
    req: Request,
    payload: RoadmapDataPaylod,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    user = verify_admin(
        session=session, authenticated=req.state.authenticated)
    organisation_id = payload.get('organisation_id')
    organisation = crud_organisation.get_organisation_by_id(
        session=session, id=organisation_id)
    organisation = organisation.serialize
    org_member = " - ".join(organisation.get('member'))
    org_name = organisation.get('name')
    datapoint_name = " | ".join([org_member, org_name])
    roadmap_data = RoadmapData(
        name=datapoint_name,
        created_by=user.id,
        organisation=organisation_id,
        created=datetime.now(),
        updated=None
    )
    keys = [key for key, value in payload.get('answers').items()]
    qids = []
    for qid in keys:
        if "-" in qid:
            continue
        qids.append(int(qid))
    questions = crud_roadmap.get_questions_by_ids(
        session=session, ids=qids)
    question_type = {}
    for q in [q.serializeType for q in questions]:
        question_type.update({str(q.get('id')): q.get('type')})
    answers = []
    for key, value in payload.get('answers').items():
        qid = key
        repeat_index = 0
        if '-' in key:
            splitted = key.split('-')
            qid = str(splitted[0])
            repeat_index = int(splitted[1])
        if qid not in question_type:
            continue
        answers.append({
            'question': int(qid),
            'type': question_type.get(qid),
            'repeat_index': repeat_index,
            'value': value
        })
    crud_roadmap.add_roadmap_data(
        session=session, data=roadmap_data, answers=answers)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
