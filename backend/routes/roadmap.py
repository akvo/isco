import os
import json
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
from models.roadmap_question_group import RoadmapFormJson
from models.roadmap_data import RoadmapDataPaylod
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
    data_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
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
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
