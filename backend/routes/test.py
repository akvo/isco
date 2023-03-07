from fastapi import Depends, APIRouter, Request
from fastapi import Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from db.connection import get_session
from models.user import User
from http import HTTPStatus

security = HTTPBearer()
test_route = APIRouter()


@test_route.get(
    "/test/user/delete",
    responses={204: {"model": None}},
    status_code=HTTPStatus.NO_CONTENT,
    summary="delete all test user (name@test.test)",
    name="test:delete_user",
    tags=["Test"])
def delete_test_user(req: Request, session: Session = Depends(get_session)):
    test_users = session.query(User).filter(User.email.ilike("%@test.test"))
    if not test_users:
        return Response(status_code=HTTPStatus.NOT_FOUND.value)
    test_users.delete(synchronize_session="fetch")
    session.commit()
    return Response(status_code=HTTPStatus.NO_CONTENT.value)
