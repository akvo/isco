import os
from math import ceil
from middleware import Token, authenticate_user
from middleware import create_access_token, verify_user
from middleware import get_password_hash, verify_admin, verify_super_admin
from middleware import decode_token, verify_token
from fastapi import Depends, HTTPException, status, APIRouter, Request, Query
from fastapi import Form
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from db.connection import get_session
from models.user import UserDict, UserBase, UserOrgDict, UserInvitation
from models.user import UserResponse, UserRole, UserUpdateByAdmin
from models.user import User
from models.organisation_member import OrganisationMember
from models.form import Form as FormModel
from pydantic import SecretStr
from db import crud_user, crud_organisation
from typing import List, Optional
from util.mailer import Email, MailTypeEnum

security = HTTPBearer()
user_route = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")
oauth2_scopes = ["openid", "email"]
webdomain = os.environ["WEBDOMAIN"]


def send_verification_email(user, recipients, type=MailTypeEnum.verify_email):
    email_token = create_access_token(data={"email": user['email']})
    url = f"{webdomain}/verify_email/{email_token}"
    email = Email(recipients=recipients,
                  type=type,
                  button_url=url)
    email.send


@user_route.post("/user/login",
                 response_model=Token,
                 summary="user login",
                 name="user:login",
                 tags=["User"])
def login(req: Request,
          payload: OAuth2PasswordRequestForm = Depends(),
          session: Session = Depends(get_session)):
    if not payload.grant_type == "password":
        raise HTTPException(status_code=404, detail="Invalid Grant Type")
    if payload.client_id != os.environ["CLIENT_ID"]:
        raise HTTPException(status_code=404, detail="Invalid Client ID")
    if payload.client_secret != os.environ["CLIENT_SECRET"]:
        raise HTTPException(status_code=404, detail="Invalid Client Secret")
    for scope in payload.scopes:
        if scope not in oauth2_scopes:
            raise HTTPException(status_code=404, detail="Scope Not Found")
    user = authenticate_user(session=session,
                             email=payload.username,
                             password=payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"email": user.email})
    return {"access_token": access_token,
            "token_type": "bearer",
            "user": user.serialize}


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
                 summary="user register",
                 name="user:register",
                 tags=["User"])
def register(req: Request,
             payload: UserBase = Depends(UserBase.as_form),
             invitation: Optional[bool] = False,
             session: Session = Depends(get_session)):
    if (payload.password):
        payload.password = payload.password.get_secret_value()
        payload.password = get_password_hash(payload.password)
    user = crud_user.add_user(session=session,
                              payload=payload,
                              invitation=invitation)
    recipients = [user.recipient]
    user = user.serialize
    if invitation:
        # Send invitation email
        url = f"{webdomain}/invitation/{user['invitation']}"
        email = Email(recipients=recipients,
                      type=MailTypeEnum.invitation,
                      button_url=url)
        email.send
    if not invitation:
        # send email register success with email verification link
        send_verification_email(user, recipients)
        # notify admin
        admins = session.query(User).filter(
                User.organisation == user['organisation'],
            ).filter(
                or_(
                    User.role == UserRole.secretariat_admin,
                    User.role == UserRole.member_admin,
                )).all()
        body = f"{user['name']} ({user['email']}) has been registered."
        email = Email(recipients=[a.recipient for a in admins],
                      type=MailTypeEnum.register,
                      body=body)
        email.send
    return user


@user_route.put("/user/verify_email",
                response_model=UserDict,
                summary="verify user email",
                name="user:verify_email",
                tags=["User"])
def verify_email(req: Request,
                 email: str,
                 session: Session = Depends(get_session)):
    TESTING = os.environ.get("TESTING")
    if TESTING:
        user = crud_user.verify_user_email(session=session, email=email)
        return user.serialize
    decode = verify_token(decode_token(email))
    user = crud_user.verify_user_email(session=session, email=decode["email"])
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
                    password: SecretStr = Form(...),
                    session: Session = Depends(get_session)):
    password = get_password_hash(password.get_secret_value())
    user = crud_user.accept_invitation(session=session,
                                       invitation=invitation,
                                       password=password)
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    access_token = create_access_token(data={"email": user["email"]})
    return {"access_token": access_token,
            "token_type": "bearer",
            "user": user}


@user_route.put("/user/update_by_admin/{id:path}",
                response_model=UserDict,
                summary="update / approved user by admin",
                name="user:update_by_admin",
                tags=["User"])
def update_user(req: Request,
                id: int,
                payload: UserUpdateByAdmin,
                approved: Optional[bool] = False,
                session: Session = Depends(get_session),
                credentials: credentials = Depends(security)):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    user = crud_user.update_user_by_admin(session=session,
                                          id=id,
                                          approved=approved,
                                          payload=payload)
    res = user.serialize
    if approved and res['approved']:
        # send approved notification to user
        forms = session.query(FormModel).filter(
            FormModel.id.in_(res['questionnaires'])).all()
        forms = [f.only_form_detail for f in forms]
        texts = [f"<li>{f['name']}</li>" for f in forms]
        context = f'''<div>You can now enter data on:
                    <ul>{texts}</ul></div>'''
        email = Email(recipients=[user.recipient],
                      type=MailTypeEnum.user_approved,
                      context=context)
        email.send
    return res


@user_route.put("/user/update_password",
                response_model=UserDict,
                summary="update password",
                name="user:update_password",
                tags=["User"])
def update_password(req: Request,
                    old_password: SecretStr = Form(...),
                    new_password: SecretStr = Form(...),
                    session: Session = Depends(get_session),
                    credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    old_password = old_password.get_secret_value()
    user = authenticate_user(session=session,
                             email=user.email,
                             password=old_password)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Incorrect old password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    new_password = get_password_hash(new_password.get_secret_value())
    user = crud_user.update_password(session=session,
                                     id=user.id,
                                     password=new_password)
    return user.serialize


@user_route.post("/user/forgot-password",
                 status_code=201,
                 summary="Generate Forgot Password Link",
                 name="user:forgot-password",
                 tags=["User"])
def new_forgot_password(req: Request,
                        email: str = Form(...),
                        session: Session = Depends(get_session)):
    reset_password = crud_user.new_reset_password(session=session, email=email)
    if not reset_password:
        raise HTTPException(status_code=404, detail="User Not found")
    # Send reset password email
    user = crud_user.get_user_by_email(session=session, email=email)
    url = f"{webdomain}/reset-password/{reset_password['url']}"
    email = Email(recipients=[user.recipient],
                  type=MailTypeEnum.reset_password,
                  button_url=url)
    email.send
    return JSONResponse(status_code=status.HTTP_201_CREATED,
                        content={"message": "url is generated"})


@user_route.get("/user/reset-password/{url:path}",
                response_model=UserInvitation,
                summary="Verify reset password",
                name="user:reset-password",
                tags=["User"])
def get_forgot_password(req: Request,
                        url: str,
                        session: Session = Depends(get_session)):
    reset_password = crud_user.get_reset_password(session=session, url=url)
    if not reset_password:
        raise HTTPException(status_code=404, detail="URL is not valid")
    reset_password = reset_password.serialize
    if reset_password["expired"]:
        return JSONResponse(status_code=status.HTTP_410_GONE,
                            content={"message": "url is expired"})
    user = crud_user.get_user_by_id(session=session, id=reset_password["user"])
    return user.serialize


@user_route.post("/user/reset-password/{url:path}",
                 response_model=Token,
                 summary="Reset password",
                 name="user:reset-password",
                 tags=["User"])
def post_forgot_password(req: Request,
                         url: str,
                         password: SecretStr = Form(...),
                         session: Session = Depends(get_session)):
    reset_password = crud_user.get_reset_password(session=session, url=url)
    if not reset_password:
        raise HTTPException(status_code=404, detail="URL is not valid")
    reset_password = reset_password.serialize
    if reset_password["expired"]:
        return JSONResponse(status_code=status.HTTP_410_GONE,
                            content={"message": "url is expired"})
    password = get_password_hash(password.get_secret_value())
    user = crud_user.update_password(session=session,
                                     id=reset_password["user"],
                                     password=password)
    crud_user.delete_reset_password(session=session, url=url)
    access_token = create_access_token(data={"email": user.email})
    return {"access_token": access_token,
            "token_type": "bearer",
            "user": user.serialize}


@user_route.get("/user/resend_verification_email",
                response_model=UserDict,
                summary="resend verification email",
                name="user:resend_verification_email",
                tags=["User"])
def resend_verification_email(req: Request, email: str,
                              session: Session = Depends(get_session)):
    # resend email verification link
    user = crud_user.get_user_by_email(session=session, email=email)
    send_verification_email(user.serialize, [user.recipient])
    return user.serialize
