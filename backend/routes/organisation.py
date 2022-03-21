from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy.orm import Session
import db.crud_organisation as crud
from db.connection import get_session
from models.organisation import OrganisationBase, OrganisationDict
from models.organisation import OrganisationPayload

security = HTTPBearer()
organisation_route = APIRouter()


@organisation_route.post("/organisation",
                         response_model=OrganisationBase,
                         summary="add new organisation",
                         name="organisation:create",
                         tags=["Organisation"])
def add(req: Request, organisation: OrganisationPayload,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    organisation = crud.add_organisation(session=session,
                                         payload=organisation)
    return organisation.serialize


@organisation_route.get("/organisation/",
                        response_model=List[OrganisationDict],
                        summary="get all organisations",
                        name="organisation:get_all",
                        tags=["Organisation"])
def get(req: Request, session: Session = Depends(get_session)):
    organisation = crud.get_organisation(session=session)
    return [o.serialize for o in organisation]


@organisation_route.get("/organisation/{id:path}",
                        response_model=OrganisationBase,
                        summary="get organisation by id",
                        name="organisation:get_by_id",
                        tags=["Organisation"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    organisation = crud.get_organisation_by_id(session=session, id=id)
    return organisation.serialize


@organisation_route.put("/organisation/{id:path}",
                        response_model=OrganisationDict,
                        summary="update organisation",
                        name="organisation:put",
                        tags=["Organisation"])
def update(req: Request, id: int, payload: OrganisationPayload,
           session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    organisation = crud.update_organisation(session=session,
                                            id=id, payload=payload)
    return organisation.serialize


@organisation_route.delete("/organisation/{id:path}",
                           responses={204: {
                               "model": None
                            }},
                           status_code=HTTPStatus.NO_CONTENT,
                           summary="delete organisation by id",
                           name="organisation:delete",
                           tags=["Organisation"])
def delete(req: Request, id: int, session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    crud.delete_organisation(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
