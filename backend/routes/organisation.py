
from fastapi import Depends, Request, APIRouter, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
import db.crud_organisation as crud
from db.connection import get_session
from models.organisation import OrganisationBase, OrganisationDict

organisation_route = APIRouter()


@organisation_route.get("/organisation",
                        response_model=List[OrganisationBase],
                        summary="get all organisations",
                        tags=["Organisation"])
def get(req: Request, session: Session = Depends(get_session)):
    organisation = crud.get_organisation(session=session)
    return organisation


@organisation_route.get("/organisation/{id:path}",
                        response_model=OrganisationDict,
                        summary="get organisation by id",
                        tags=["Organisation"])
def get_by_id(req: Request, id: int, session: Session = Depends(get_session)):
    organisation = crud.get_organisation_by_id(session=session, id=id)
    if not organisation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organisation {id} not found.")
    return organisation.serialize
