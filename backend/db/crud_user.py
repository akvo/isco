from sqlalchemy.orm import Session
from models.user import User, UserBase, UserDict


def get_user_by_email(session: Session, email: str) -> User:
    user = session.query(User).filter(User.email == email).first()
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
