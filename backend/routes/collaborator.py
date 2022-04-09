from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_collaborator as crud
from db.connection import get_session
from models.collaborator import CollaboratorDict, CollaboratorPayload

security = HTTPBearer()
collaborator_route = APIRouter()


@collaborator_route.post("/collaborator/{data:path}",
                         response_model=List[CollaboratorDict],
                         summary="add new collaborator",
                         name="collaborator:create",
                         tags=["Collaborator"])
def add(req: Request, data: int, payload: CollaboratorPayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    collaborators = crud.add_collaborator(
        session=session, data=data, payload=payload)
    return [c.serialize for c in collaborators]


@collaborator_route.put("/collaborator/{data:path}",
                        response_model=List[CollaboratorDict],
                        summary="update member type",
                        name="collaborator:put",
                        tags=["Collaborator"])
def update(req: Request, data: int, payload: CollaboratorPayload,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    # get collaborator by data as current collaborator
    current_collabs = crud.get_collaborator_by_data(session=session, data=data)
    current_collabs = [c.serialize for c in current_collabs]
    # to add
    to_add = []
    for p in payload:
        if not any(current['organisation'] == p['organisation']
                   for current in current_collabs):
            to_add.append(p)
    # to delete
    to_delete = []
    for current in current_collabs:
        if not any(p['organisation'] == current['organisation']
                   for p in payload):
            to_delete.append(current['id'])
    crud.delete_collaborator_by_ids(session=session, ids=to_delete)
    collaborators = crud.add_collaborator(
        session=session, data=data, payload=payload)
    return [c.serialize for c in collaborators]


@collaborator_route.get("/collaborator/{data:path}",
                        response_model=List[CollaboratorDict],
                        summary="get collaborator by data id",
                        name="collaborator:get_by_data_id",
                        tags=["Collaborator"])
def get_by_data_id(req: Request, data: int,
                   session: Session = Depends(get_session)):
    collaborator = crud.get_collaborator_by_data(session=session, data=data)
    return collaborator.serialize
