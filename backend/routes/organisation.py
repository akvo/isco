from math import ceil
from http import HTTPStatus
from fastapi import Depends, Request, APIRouter, Response, Query, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List, Optional
from sqlalchemy.orm import Session
import db.crud_organisation as crud
from db.connection import get_session
from models.organisation import OrganisationBase, OrganisationDict
from models.organisation import OrganisationPayload, Organisation
from models.organisation import OrganisationResponse
from middleware import verify_super_admin, organisations_in_same_isco

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


@organisation_route.get("/organisation/paginated",
                        response_model=OrganisationResponse,
                        summary="get organisations with pagination",
                        name="organisation:get_paginated",
                        tags=["Organisation"])
def get_paginated(req: Request,
                  page: int = 1,
                  page_size: int = 10,
                  organisation: Optional[List[int]] = Query(None),
                  member: Optional[List[int]] = Query(None),
                  isco: Optional[List[int]] = Query(None),
                  session: Session = Depends(get_session)):
    organisation = crud.filter_organisation(
        session=session,
        page=page,
        page_size=page_size,
        organisation=organisation,
        member=member,
        isco=isco)
    total_data = organisation['count']
    data = organisation['downloads']
    if not data:
        return []
    total_page = ceil(total_data / page_size) if total_data > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    data = [d.serialize for d in data]
    return {
        'current': page,
        'data': data,
        'total': total_data,
        'total_page': total_page,
    }


@organisation_route.get("/organisation/isco",
                        response_model=List[OrganisationDict],
                        summary="get organisations in same isco",
                        name="organisation:get_organisation_in_same_isco",
                        tags=["Organisation"])
def get_organisation_in_same_isco(
    req: Request,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    admin = verify_super_admin(session=session,
                               authenticated=req.state.authenticated)
    org_ids = organisations_in_same_isco(
        session=session, organisation=admin.organisation)
    organisation = session.query(Organisation).filter(
        Organisation.id.in_(org_ids)).all()
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
                           responses={204: {"model": None}},
                           status_code=HTTPStatus.NO_CONTENT,
                           summary="delete organisation by id",
                           name="organisation:delete",
                           tags=["Organisation"])
def delete(req: Request, id: int, session: Session = Depends(get_session),
           credentials: credentials = Depends(security)):
    crud.delete_organisation(session=session, id=id)
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
