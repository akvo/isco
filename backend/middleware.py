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
from db import crud_user


# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = os.environ['SECRET_KEY']
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 1
TOKEN_TMP = "./tmp/token.txt"
query_pattern = re.compile(r"[0-9]*\|(.*)")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class Token(BaseModel):
    access_token: str
    token_type: str


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
    return encoded_jwt


def decode_token(token: str = Depends(oauth2_scheme)):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except exceptions.ExpiredSignatureError:
        return {"email": None, "exp": 0}


def verify_token(authenticated):
    if datetime.now().timestamp() > authenticated.get("exp"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Unauthorized")
    return authenticated


def verify_user(session: Session, authenticated):
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
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please check your email inbox to verify email account")
    return user.serialize


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
