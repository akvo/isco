from math import ceil
from middleware import Token, authenticate_user
from middleware import create_access_token, verify_user
from fastapi import Depends, HTTPException, status, APIRouter, Request, Query
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from db.connection import get_session
from models.user import UserDict, UserBase, UserOrgDict, UserInvitation
from models.user import UserResponse, UserRole, UserUpdateByAdmin
from models.user import User
from models.organisation_member import OrganisationMember
from pydantic import SecretStr
from db import crud_user, crud_organisation
from middleware import get_password_hash, verify_admin, verify_super_admin
from typing import List, Optional

security = HTTPBearer()
user_route = APIRouter()


@user_route.post("/user/login",
                 response_model=Token,
                 summary="user login",
                 name="user:login",
                 tags=["User"])
def login(req: Request,
          email: str,
          password: SecretStr,
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


@user_route.get("/user",
                response_model=UserResponse,
                summary="get all users",
                name="user:get_all",
                tags=["User"])
def get_all(req: Request,
            page: int = 1,
            limit: int = 10,
            search: Optional[str] = None,
            organisation: Optional[List[int]] = Query(None),
            session: Session = Depends(get_session),
            credentials: credentials = Depends(security)):
    admin = verify_admin(session=session,
                         authenticated=req.state.authenticated)
    org_ids = None
    if organisation:
        org_ids = organisation
    # if role member admin, filter user by member admin organisation id
    if admin.role == UserRole.member_admin:
        org_ids = [admin.organisation]
    user = crud_user.get_all_user(session=session,
                                  search=search,
                                  organisation=org_ids,
                                  skip=(limit * (page - 1)),
                                  limit=limit)
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    # count total user
    total = crud_user.count(session=session,
                            search=search,
                            organisation=org_ids)
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
                response_model=UserOrgDict,
                summary="get account information",
                name="user:me",
                tags=["User"])
def me(req: Request,
       session: Session = Depends(get_session),
       credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    organisation = crud_organisation.get_organisation_by_id(
        session=session, id=user.organisation)
    res = user.serialize
    res['organisation'] = organisation.serialize
    return res


@user_route.post("/user/register",
                 response_model=UserDict,
                 summary="use register",
                 name="user:register",
                 tags=["User"])
def register(req: Request,
             payload: UserBase,
             session: Session = Depends(get_session)):
    if (payload.password):
        payload.password = get_password_hash(payload.password)
    user = crud_user.add_user(session=session, payload=payload)
    return user.serialize


@user_route.put("/user/verify_email/{id:path}",
                response_model=UserDict,
                summary="verify user email",
                name="user:verify_email",
                tags=["User"])
def verify_email(req: Request,
                 id: int,
                 session: Session = Depends(get_session)):
    user = crud_user.verify_user_email(session=session, id=id)
    return user.serialize


@user_route.get("/user/member/{member_type:path}",
                response_model=Optional[List[UserDict]],
                summary="filter user by member type",
                name="user:filter_by_member_type",
                tags=["User"])
def filter_user_by_member(req: Request,
                          member_type: int,
                          session: Session = Depends(get_session),
                          credentials: credentials = Depends(security)):
    members = session.query(OrganisationMember).filter(
        OrganisationMember.member_type == member_type).all()
    org_ids = [m['organisation'] for m in [om.serialize for om in members]]
    # filter user by org_ids
    user = session.query(User).filter(User.organisation.in_(org_ids)).all()
    return [u.serialize for u in user]


@user_route.get("/user/invitation/{invitation:path}",
                response_model=UserInvitation,
                summary="get invitation detail",
                name="user:invitation",
                tags=["User"])
def invitation(req: Request,
               invitation: str,
               session: Session = Depends(get_session)):
    user = crud_user.get_invitation(session=session, invitation=invitation)
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    return user


@user_route.post("/user/invitation/{invitation:path}",
                 response_model=Token,
                 summary="get invitation detail",
                 name="user:invitation",
                 tags=["User"])
def change_password(req: Request,
                    invitation: str,
                    password: SecretStr,
                    session: Session = Depends(get_session)):
    password = get_password_hash(password.get_secret_value())
    user = crud_user.accept_invitation(session=session,
                                       invitation=invitation,
                                       password=password)
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    access_token = create_access_token(data={"email": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}


@user_route.put("/user/update_by_admin/{id:path}",
                response_model=UserDict,
                summary="update user by admin",
                name="user:update_by_admin",
                tags=["User"])
def update_user(req: Request,
                id: int,
                payload: UserUpdateByAdmin,
                session: Session = Depends(get_session),
                credentials: credentials = Depends(security)):
    verify_super_admin(session=session,
                       authenticated=req.state.authenticated)
    user = crud_user.update_user_by_admin(session=session,
                                          id=id,
                                          payload=payload)
    return user.serialize
