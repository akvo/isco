import os
import json
from pydantic import Required
from typing import Optional
from fastapi import Depends, Request, APIRouter, status
from fastapi import HTTPException, Query
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from db.connection import get_session
from db import crud_organisation
from db import crud_roadmap
from models.roadmap_question_group import RoadmapFormJson
# from middleware import verify_super_admin, verify_editor

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
    organisation_id: int = Query(default=Required),
    data_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    # validate is organisation exist
    organisation = crud_organisation.get_organisation_by_id(
        session=session, id=organisation_id)
    # get roadmap template by organisation
    template = {}
    roadmap_templates = crud_roadmap.get_roadmap_template_by_organisation_id(
        session=session, organisation_id=organisation.id)
    roadmap_templates = [rt.serialize for rt in roadmap_templates]
    for rt in roadmap_templates:
        template.update({str(rt.get('question')): rt.get('mandatory')})
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
    # refactor roadmap form with roadmap template
    updated_qg = []
    for qg in question_group:
        updated_q = []
        for q in qg.get('question'):
            qid = str(q.get('id'))
            if qid in template:
                mandatory = template.get(qid)
                q.update({'required': mandatory})
            updated_q.append(q)
        qg.update({'question': updated_q})
        updated_qg.append(qg)
    # TODO:: Get initial value when receive data_id query param
    roadmap_webform.update({
        "languages": None,
        "version": 1,
        "tree": None,
        "question_group": updated_qg
    })
    return roadmap_webform
