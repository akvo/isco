import os
import json
from math import ceil
from datetime import datetime
from http import HTTPStatus
# from pydantic import Required
from typing import Optional
from fastapi import Depends, Request, APIRouter, status
from fastapi import HTTPException, Query, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from db.connection import get_session
import util.report as report
from db import crud_roadmap
from db import crud_organisation
from models.roadmap_question_group import RoadmapFormJson
from models.roadmap_data import RoadmapDataPaylod, RoadmapData
from models.roadmap_data import RoadmapDataResponse
from models.roadmap_answer import RoadmapAnswer
from models.organisation_member import OrganisationMember
from middleware import verify_admin
import util.storage as storage

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_file = "./source/roadmap.json"

security = HTTPBearer()
roadmap_route = APIRouter()


@roadmap_route.get(
    "/roadmap-webform",
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
        session=session,
        authenticated=req.state.authenticated)
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
    roadmap_webform.update({
        "languages": None,
        "version": 1,
        "tree": None,
        "question_group": question_group,
        "initial_value": None,
        "organisation_ids": None,
    })
    # Get organisation ids from roadmap data to detect
    # which org has submitted roadmap setup
    orgs = session.query(RoadmapData).all()
    org_ids = [o.organisation for o in orgs]
    if len(org_ids):
        roadmap_webform.update({
            "organisation_ids": org_ids,
        })
    if data_id:
        answers = crud_roadmap.get_answer_by_data(
            session=session, data_id=data_id)
        values = [a.to_initial_value for a in answers]
        roadmap_webform.update({
            "initial_value": values
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
        session=session,
        authenticated=req.state.authenticated)
    organisation_id = payload.get('organisation_id')
    language = payload.get('language')
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
        language=language,
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


@roadmap_route.get(
    "/roadmap-data",
    response_model=RoadmapDataResponse,
    summary="get all roadmap datapoint",
    name="roadmap:get_datapoints",
    tags=["Roadmap"])
def get_datapoints(
    req: Request,
    member_type: Optional[int] = Query(None),
    page: int = Query(default=1),
    page_size: int = Query(default=10),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    verify_admin(
        session=session,
        authenticated=req.state.authenticated)
    org_ids = None
    if member_type:
        org_member = session.query(OrganisationMember).filter(
            OrganisationMember.member_type.in_([member_type])).all()
        if not org_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No organisation found")
        org_ids = [om.organisation for om in org_member]
    data = crud_roadmap.get_data(
        session=session,
        organisation_ids=org_ids,
        skip=(page_size * (page - 1)),
        page_size=page_size)
    count = data.get('count')
    if not count:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Data Not Found")
    total_page = ceil(count / page_size) if count > 0 else 0
    if total_page < page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Data Not Found")
    return {
        "current": page,
        "data": [d.serializeDatapoint for d in data.get('data')],
        "total": count,
        "total_page": total_page
    }


@roadmap_route.put(
    "/roadmap-webform/{data_id}",
    status_code=HTTPStatus.NO_CONTENT,
    summary="update roadmap datapoint by id",
    name="roadmap:update_datapoint",
    tags=["Roadmap"])
def update_datapoint(
    req: Request,
    data_id: int,
    payload: RoadmapDataPaylod,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    verify_admin(
        session=session,
        authenticated=req.state.authenticated)
    organisation_id = payload.get('organisation_id')
    data = crud_roadmap.get_data_by_id(
        session=session, id=data_id, organisation_id=organisation_id)
    # get current answer
    current_answers = crud_roadmap.get_answer_by_data(
        session=session, data_id=data.id)
    current_answer = {}
    [current_answer.update(ca.to_dict) for ca in current_answers]
    # get question type from answer
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
    # iterate answer payload to check if new/update answer
    for key, value in payload.get('answers').items():
        qid = key
        repeat_index = 0
        if '-' in key:
            splitted = key.split('-')
            qid = str(splitted[0])
            repeat_index = int(splitted[1])
        if qid not in question_type:
            continue
        # update answer
        if key in current_answer and value != current_answer.get('value'):
            current = current_answer.get(key)
            crud_roadmap.update_roadmap_answer(
                session=session,
                answer=current.get('data'),
                type=question_type.get(qid),
                repeat_index=current.get('repeat_index'),
                value=value)
        # new answer
        if key not in current_answer:
            new_answer = RoadmapAnswer(
                question=int(qid),
                data=data.id,
                repeat_index=repeat_index,
                created=datetime.now())
            crud_roadmap.add_roadmap_answer(
                session=session,
                answer=new_answer,
                type=question_type.get(qid),
                value=value)
    # delete answer
    for key, obj in current_answer.items():
        if key in payload.get('answers'):
            continue
        # delete
        crud_roadmap.delete_roadmap_answer_by_id(
            session=session, id=obj.get('id'))
    # update roadmap data
    crud_roadmap.update_roadmap_data(session=session, data=data)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@roadmap_route.delete(
    "/roadmap-data/{id}",
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete roadmap datapoint by id",
    name="roadmap:delete_datapoint",
    tags=["Roadmap"])
def delete_datapoint(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    verify_admin(
        session=session,
        authenticated=req.state.authenticated)
    crud_roadmap.delete_roadmap_data_by_id(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)


@roadmap_route.get(
    "/roadmap-download/{id:path}",
    summary="direct download roadmap data by id",
    response_model=str,
    status_code=201,
    name="roadmap:download_file",
    tags=["Roadmap"])
def request_new_download(
    req: Request,
    id: int,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    verify_admin(
        session=session,
        authenticated=req.state.authenticated)
    data = crud_roadmap.get_data_by_id(session=session, id=id)
    data = data.to_report
    detail = report.transform_data(
        answers=data["answer"],
        session=session,
        questionGroupModel=False)
    file = report.generate(data=data, detail=detail)
    location = storage.download(url=file)
    return FileResponse(location)
