import os
import json
# from http import HTTPStatus
from fastapi import Depends, Request, APIRouter
# from fastapi import Response, HTTPException
from fastapi.security import HTTPBearer
# from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from db.connection import get_session
from models.roadmap_question_group import RoadmapFormJson, RoadmapQuestionGroup
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
def get(req: Request, session:
        Session = Depends(get_session),
        # credentials: credentials = Depends(security)
        ):
    f = open(source_file)
    roadmap_webform = json.load(f)
    question_groups = session.query(RoadmapQuestionGroup).all()
    question_group = [qg.serializeJson for qg in question_groups]
    roadmap_webform.update({
        "languages": None,
        "version": 1,
        "tree": None,
        "question_group": question_group
    })
    return roadmap_webform
