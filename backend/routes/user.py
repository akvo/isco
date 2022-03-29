from math import ceil
from middleware import Token, authenticate_user
from middleware import create_access_token, verify_user
from fastapi import Depends, HTTPException, status, APIRouter, Request
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from db.connection import get_session
from models.user import UserDict, UserBase
from models.user import UserResponse, UserRole
from pydantic import SecretStr
from db import crud_user
from middleware import get_password_hash, verify_admin
from typing import List, Optional

security = HTTPBearer()
user_route = APIRouter()


@user_route.post("/user/login",
                 response_model=Token,
                 summary="user login",
                 name="user:login",
                 tags=["User"])
def login(req: Request, email: str, password: SecretStr,
          session: Session = Depends(get_session)):
    user = authenticate_user(session=session,
                             email=email,
                             password=password.get_secret_value())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@user_route.get("/user/",
                response_model=UserResponse,
                summary="get all users",
                name="user:get_all",
                tags=["User"])
def get_all(req: Request, page: int = 1, limit: int = 10,
            session: Session = Depends(get_session),
            credentials: credentials = Depends(security)):
    admin = verify_admin(session=session,
                         authenticated=req.state.authenticated)
    organisation = None
    # if role member admin, filter user by member admin organisation id
    if admin['role'] == UserRole.member_admin:
        organisation = admin['organisation']
    user = crud_user.get_all_user(session=session, organisation=organisation,
                                  skip=(limit * (page - 1)), limit=limit)
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    # count total user
    total = crud_user.count(session=session, organisation=organisation)
    user = [u.serialize for u in user]
    total_page = ceil(total / limit) if total > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        'current': page,
        'data': user,
        'total': total,
        'total_page': total_page
    }


@user_route.get("/user/me",
                response_model=UserDict,
                summary="get account information",
                name="user:me",
                tags=["User"])
def me(req: Request, session: Session = Depends(get_session),
       credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    return user


@user_route.post("/user/register",
                 response_model=UserDict,
                 summary="use register",
                 name="user:register",
                 tags=["User"])
def register(req: Request, payload: UserBase,
             session: Session = Depends(get_session)):
    payload.password = get_password_hash(payload.password)
    user = crud_user.add_user(session=session, payload=payload)
    return user.serialize


@user_route.put("/user/verify_email/{id:path}",
                response_model=UserDict,
                summary="verify user email",
                name="user:verify_email",
                tags=["User"])
def verify_email(req: Request, id: int,
                 session: Session = Depends(get_session)):
    user = crud_user.verify_user_email(session=session, id=id)
    return user.serialize


@user_route.get("/user/member/{member_type:path}",
                response_model=Optional[List[UserDict]],
                summary="filter user by member type",
                name="user:filter_by_member_type",
                tags=["User"])
def filter_user_by_member(req: Request, member_type: int,
                          session: Session = Depends(get_session),
                          credentials: credentials = Depends(security)):
    user = crud_user.get_user_by_member_type(session=session,
                                             member_type=member_type)
    return [u.serialize for u in user]
