from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.organisation import Organisation, OrganisationDict
from models.organisation import OrganisationPayload, OrganisationBase
from models.organisation_isco import OrganisationIsco
from models.organisation_member import OrganisationMember


def add_organisation(session: Session,
                     payload: OrganisationPayload) -> OrganisationDict:
    active = True if payload['active'] is None else payload['active']
    organisation = Organisation(code=payload['code'],
                                name=payload['name'],
                                active=active)
    if payload['member_type']:
        for it in payload['member_type']:
            member = OrganisationMember(id=None,
                                        organisation=None,
                                        member_type=it)
            organisation.member_type.append(member)
    if payload['isco_type']:
        for it in payload['isco_type']:
            isco = OrganisationIsco(id=None,
                                    organisation=None,
                                    isco_type=it)
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


def get_organisation_by_membery_type(session: Session,
                                     member_type: int
                                     ) -> List[OrganisationDict]:
    organisation = session.query(
        Organisation).filter(
            Organisation.member_type == member_type).all()
    return organisation


def get_organisation_by_name(session: Session, name: str) -> OrganisationBase:
    return session.query(Organisation).filter(
        Organisation.name.ilike("%{}%".format(name.lower().strip()))).first()


def update_organisation(session: Session, id: int,
                        payload: OrganisationPayload) -> OrganisationDict:
    organisation = get_organisation_by_id(session=session, id=id)
    organisation.code = payload['code']
    organisation.name = payload['name']
    organisation.active = payload['active']
    if payload['member_type']:
        delete_member_type_by_group_id(session=session, orgs=[id])
        for ma in payload['member_type']:
            member = OrganisationMember(id=None,
                                        organisation=None,
                                        member_type=ma)
            organisation.member_type.append(member)
    if payload['isco_type']:
        delete_isco_type_by_group_id(session=session, orgs=[id])
        for ia in payload['isco_type']:
            isco = OrganisationIsco(id=None,
                                    organisation=None,
                                    isco_type=ia)
            organisation.isco_type.append(isco)
    session.commit()
    session.flush()
    session.refresh(organisation)
    return organisation


def delete_organisation(session: Session, id: int):
    organisation = get_organisation_by_id(session=session, id=id)
    session.delete(organisation)
    session.commit()
    session.flush()


def delete_member_type_by_group_id(session: Session, orgs: List[int]):
    session.query(OrganisationMember).filter(
        OrganisationMember.organisation.in_(orgs)
    ).delete(synchronize_session='fetch')
    session.commit()


def delete_isco_type_by_group_id(session: Session, orgs: List[int]):
    session.query(OrganisationIsco).filter(
        OrganisationIsco.organisation.in_(orgs)
    ).delete(synchronize_session='fetch')
    session.commit()
