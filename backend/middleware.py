import os
import re
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from jose import JWTError, jwt, exceptions
from passlib.context import CryptContext
from models.user import UserRole, UserDict, User
from models.organisation_isco import OrganisationIsco
from db import crud_user


# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 1
TOKEN_TMP = "./tmp/token.txt"
query_pattern = re.compile(r"[0-9]*\|(.*)")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class Token(BaseModel):
    access_token: str
    token_type: str
    expired: datetime
    user: UserDict


class TokenData(BaseModel):
    email: Optional[str] = None


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def authenticate_user(session: Session, email: str, password: str):
    user = crud_user.get_user_by_email(session=session, email=email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return {"token": encoded_jwt, "expired": expire}


def decode_token(token: str = Depends(oauth2_scheme)):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except exceptions.ExpiredSignatureError:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )


def verify_token(authenticated):
    if authenticated and datetime.now().timestamp() > authenticated.get("exp"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )
    return authenticated


def verify_user(session: Session, authenticated):
    TESTING = os.environ.get("TESTING")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    authenticated = verify_token(authenticated)
    try:
        email: str = authenticated.get("email")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = crud_user.get_user_by_email(session=session, email=token_data.email)
    if user is None:
        raise credentials_exception
    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please check your email inbox to verify email account",
        )
    if not user.approved:
        if TESTING:
            return user
        # raise HTTPException(
        #     status_code=403,
        #     detail="Not approved")
    return user


def verify_admin(session: Session, authenticated):
    user = verify_user(session=session, authenticated=authenticated)
    role = user.role
    secretariat_admin = UserRole.secretariat_admin
    member_admin = UserRole.member_admin
    if role != secretariat_admin and role != member_admin:
        raise HTTPException(
            status_code=403,
            detail="You don't have data access, please contact admin",
        )
    return user


def verify_super_admin(session: Session, authenticated):
    user = verify_user(session=session, authenticated=authenticated)
    if user.role != UserRole.secretariat_admin:
        raise HTTPException(
            status_code=403,
            detail="You don't have data access, super admin only",
        )
    return user


def verify_editor(session: Session, authenticated):
    user = verify_user(session=session, authenticated=authenticated)
    if user.role not in [
        UserRole.secretariat_admin,
        UserRole.member_admin,
        UserRole.member_user,
    ]:
        raise HTTPException(
            status_code=403,
            detail="You don't have data access, please contact admin",
        )
    return user


def check_query(keywords):
    keys = []
    if not keywords:
        return keys
    for q in keywords:
        if not query_pattern.match(q):
            raise HTTPException(status_code=400, detail="Bad Request")
        else:
            keys.append(q.replace("|", "||"))
    return keys


def organisations_in_same_isco(session: Session, organisation: int):
    org_isco = (
        session.query(OrganisationIsco)
        .filter(OrganisationIsco.organisation == organisation)
        .all()
    )
    isco_ids = [i.isco_type for i in org_isco]
    org_in_same_isco = (
        session.query(OrganisationIsco)
        .filter(OrganisationIsco.isco_type.in_(isco_ids))
        .all()
    )
    org_ids = [o.organisation for o in org_in_same_isco]
    return org_ids


def find_secretariat_admins(session: Session, organisation: int):
    org_ids = organisations_in_same_isco(
        session=session, organisation=organisation
    )
    admins = (
        session.query(User)
        .filter(User.organisation.in_(org_ids))
        .filter(User.role == UserRole.secretariat_admin)
        .distinct(User.email)
        .all()
    )
    return admins


def find_member_admins(session: Session, organisation: int):
    admins = (
        session.query(User)
        .filter(User.organisation == organisation)
        .filter(User.role == UserRole.member_admin)
        .distinct(User.email)
        .all()
    )
    return admins
