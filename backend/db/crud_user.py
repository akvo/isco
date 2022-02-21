from sqlalchemy.orm import Session
from models.user import User


def get_user_by_email(session: Session, email: str) -> User:
    user = session.query(User).filter(User.email == email).first()
    return user
