from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.organisation import Organisation, OrganisationDict
from models.organisation import OrganisationPayload, OrganisationBase
from models.organisation_isco import OrganisationIscoPayload
from models.organisation_isco import OrganisationIsco


def add_organisation(session: Session,
                     payload: OrganisationPayload,
                     isco_type: Optional[List[OrganisationIscoPayload]] = None
                     ) -> OrganisationDict:
    active = True if payload['active'] is None else payload['active']
    organisation = Organisation(code=payload['code'],
                                name=payload['name'],
                                member_type=payload['member_type'],
                                active=active)
    if isco_type:
        for it in isco_type:
            isco = OrganisationIsco(id=None,
                                    organisation=it['organisation'],
                                    isco_type=it['isco_type'])
            organisation.isco_type.append(isco)
    session.add(organisation)
    session.commit()
    session.flush()
    session.refresh(organisation)
    return organisation


def get_organisation(session: Session) -> List[Organisation]:
    return session.query(Organisation).all()


def get_organisation_by_id(session: Session, id: int) -> OrganisationDict:
    organisation = session.query(
        Organisation).filter(Organisation.id == id).first()
    if organisation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"organisation {id} not found")
    return organisation


def get_organisation_by_name(session: Session, name: str) -> OrganisationBase:
    return session.query(Organisation).filter(
        Organisation.name.ilike("%{}%".format(name.lower().strip()))).first()


def update_organisation(session: Session, id: int,
                        payload: OrganisationPayload) -> OrganisationBase:
    organisation = get_organisation_by_id(session=session, id=id)
    organisation.code = payload['code']
    organisation.name = payload['name']
    organisation.member_type = payload['member_type']
    organisation.active = payload['active']
    session.commit()
    session.flush()
    session.refresh(organisation)
    return organisation


def delete_organisation(session: Session, id: int):
    organisation = get_organisation_by_id(session=session, id=id)
    session.delete(organisation)
    session.commit()
    session.flush()
