from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_organisation as crud
from db.connection import get_session
from models.organisation import OrganisationBase, OrganisationDict
from models.organisation import OrganisationPayload
from models.organisation_isco import OrganisationIscoPayload

organisation_route = APIRouter()


@organisation_route.post("/organisation",
                         response_model=OrganisationDict,
                         summary="add new organisation",
                         name="organisation:create",
                         tags=["Organisation"])
def add(req: Request, organisation: OrganisationPayload,
        isco_type: Optional[List[OrganisationIscoPayload]] = None,
        session: Session = Depends(get_session)):
    organisation = crud.add_organisation(session=session,
                                         payload=organisation,
                                         isco_type=isco_type)
    return organisation.serialize


@organisation_route.get("/organisation/",
                        response_model=List[OrganisationBase],
                        summary="get all organisations",
                        name="organisation:get_all",
                        tags=["Organisation"])
def get(req: Request, session: Session = Depends(get_session)):
    organisation = crud.get_organisation(session=session)
    return [o.serialize for o in organisation]


@organisation_route.get("/organisation/{id:path}",
                        response_model=OrganisationDict,
                        summary="get organisation by id",
                        name="organisation:get_by_id",
                        tags=["Organisation"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    organisation = crud.get_organisation_by_id(session=session, id=id)
    return organisation.serialize


@organisation_route.put("/organisation/{id:path}",
                        response_model=OrganisationBase,
                        summary="update organisation",
                        name="organisation:put",
                        tags=["Organisation"])
def update(req: Request, id: int, payload: OrganisationPayload,
           session: Session = Depends(get_session)):
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
def delete(req: Request, id: int, session: Session = Depends(get_session)):
    crud.delete_organisation(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
