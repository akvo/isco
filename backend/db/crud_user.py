from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.user import User, UserBase, UserDict
from datetime import datetime
import db.crud_organisation as crud_org


def get_user_by_email(session: Session, email: str) -> User:
    user = session.query(User).filter(User.email == email).first()
    return user


def get_user_by_id(session: Session, id: int) -> UserDict:
    user = session.query(User).filter(User.id == id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"user {id} not found")
    return user


def add_user(session: Session, payload: UserBase) -> UserDict:
    user = User(name=payload.name, email=payload.email,
                phone_number=payload.phone_number, password=payload.password,
                role=payload.role, organisation=payload.organisation)
    session.add(user)
    session.commit()
    session.flush()
    session.refresh(user)
    return user


def verify_user_email(session: Session, id: int) -> UserDict:
    user = get_user_by_id(session=session, id=id)
    user.email_verified = datetime.utcnow()
    session.commit()
    session.flush()
    session.refresh(user)
    return user


def get_user_by_member_type(session: Session, member_type: int) -> UserDict:
    organisation = crud_org.get_organisation_by_membery_type(
        session=session, member_type=member_type)
    org_ids = [org.id for org in organisation]
    # filter user by org_ids
    user = session.query(User).filter(
        User.organisation.in_(org_ids)).all()
    return user
