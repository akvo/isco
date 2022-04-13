from uuid import uuid4
from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from models.user import User, UserBase, UserDict
from models.user import UserInvitation, UserUpdateByAdmin
from datetime import datetime
from typing import List, Optional


def get_user_by_email(session: Session, email: str) -> User:
    user = session.query(User).filter(User.email == email).first()
    return user


def get_user_by_id(session: Session, id: int) -> UserDict:
    user = session.query(User).filter(User.id == id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"user {id} not found")
    return user


def add_user(session: Session, payload: UserBase) -> UserDict:
    user = User(name=payload.name,
                email=payload.email,
                phone_number=payload.phone_number,
                password=payload.password,
                role=payload.role,
                organisation=payload.organisation,
                invitation=str(uuid4()),
                questionnaires=payload.questionnaires)
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


def update_user_by_admin(session: Session,
                         id: int, payload: UserBase) -> UserUpdateByAdmin:
    user = get_user_by_id(session=session, id=id)
    user.organisation = payload['organisation']
    user.role = payload['role']
    user.questionnaires = payload['questionnaires']
    session.commit()
    session.flush()
    session.refresh(user)
    return user


def filter_user(session: Session,
                search: Optional[str] = None,
                organisation: Optional[List[int]] = None):
    user = session.query(User)
    if search:
        user = user.filter(
            or_(
                User.name.ilike("%{}%".format(search.lower().strip())),
                User.email.ilike("%{}%".format(search.lower().strip())),
            ))
    if organisation:
        user = user.filter(User.organisation.in_(organisation))
    return user


def count(session: Session,
          search: Optional[str] = None,
          organisation: Optional[List[int]] = None) -> int:
    user = filter_user(session=session,
                       search=search,
                       organisation=organisation)
    user = user.count()
    return user


def get_all_user(session: Session,
                 search: Optional[str] = None,
                 organisation: Optional[List[int]] = None,
                 skip: int = 0,
                 limit: int = 10) -> List[UserDict]:
    user = filter_user(session=session,
                       search=search,
                       organisation=organisation)
    user = user.order_by(User.id.desc()).offset(skip).limit(limit).all()
    return user


def get_invitation(session: Session, invitation: str) -> UserInvitation:
    user = session.query(User).filter(User.invitation == invitation).first()
    if not user:
        return None
    return user.serialize


def accept_invitation(session: Session,
                      invitation: str,
                      password=str) -> UserInvitation:
    user = session.query(User).filter(User.invitation == invitation).first()
    if not user:
        return None
    user.password = password
    user.email_verified = datetime.now()
    session.commit()
    session.flush()
    session.refresh(user)
    return user.serialize
