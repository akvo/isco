from middleware import Token, authenticate_user
from middleware import create_access_token
from middleware import ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi import Depends, HTTPException, status, APIRouter, Request
from sqlalchemy.orm import Session
from db.connection import get_session
from datetime import timedelta

user_route = APIRouter()


@user_route.post("/login",
                 response_model=Token,
                 summary="user login",
                 tags=["User"])
def login(req: Request, email: str, password: str,
          session: Session = Depends(get_session)):
    user = authenticate_user(session=session,
                             email=email,
                             password=password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
