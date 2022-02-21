from typing import List, Optional
from sqlalchemy.orm import Session
from models.organisation import Organisation, OrganisationDict


def add_organisation(session, parent: Optional[int], code: Optional[str],
                     name: str, level: Optional[int],
                     active: Optional[bool]) -> OrganisationDict:
    level = [0 if level is None else level]
    active = [True if active is None else active]
    organisation = Organisation(parent=parent, code=code, name=name,
                                level=level, active=active)
    session.add(organisation)
    session.commit()
    session.flush()
    session.refresh(organisation)
    return organisation


def get_organisation(session: Session) -> List[Organisation]:
    return session.query(Organisation).all()


def get_organisation_by_id(session: Session, id: int) -> Organisation:
    return session.query(Organisation).filter(Organisation.id == id).first()


def get_organisation_by_name(session: Session, name: str) -> Organisation:
    return session.query(Organisation).filter(
        Organisation.name.ilike("%{}%".format(name.lower().strip()))).first()
