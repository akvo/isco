from middleware import Token, authenticate_user
from middleware import create_access_token, verify_user
from fastapi import Depends, HTTPException, status, APIRouter, Request
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from db.connection import get_session
from models.user import UserDict, UserBase
from pydantic import SecretStr
from db import crud_user
from middleware import get_password_hash

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
