from fastapi import HTTPException, status
from typing import List, Optional
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


def filter_organisation(
    session: Session,
    page: int,
    page_size: int,
    organisation: Optional[List[int]] = None,
    member: Optional[List[int]] = None,
    isco: Optional[List[int]] = None
) -> List[Organisation]:
    orgs = session.query(Organisation)
    if organisation:
        orgs = orgs.filter(Organisation.id.in_(organisation))
    org_ids = []
    member_org_ids = []
    isco_org_ids = []
    if member:
        members = session.query(OrganisationMember).filter(
            OrganisationMember.member_type.in_(member)).all()
        if members:
            member_org_ids = [m.organisation for m in members]
    if isco:
        iscos = session.query(OrganisationIsco).filter(
            OrganisationIsco.isco_type.in_(isco)).all()
        if iscos:
            isco_org_ids = [i.organisation for i in iscos]
    if member or isco:
        # concat
        org_ids = list(set(member_org_ids + isco_org_ids))
    if member and isco:
        # intersection
        org_ids = [value for value in member_org_ids if value in isco_org_ids]
    if org_ids:
        orgs = orgs.filter(Organisation.id.in_(org_ids))
    res = orgs.limit(page_size).offset((page - 1) * page_size)
    return {"downloads": res, "count": orgs.count()}


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
