# from typing import Optional
from fastapi import Depends, Request, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from db.connection import get_session
# from db.crud_user import get_user_by_id
from util.mailer import Email, MailTypeEnum

security = HTTPBearer()
template_route = APIRouter()


@template_route.get("/template/email",
                    response_class=HTMLResponse,
                    summary="get email template",
                    name="template:email",
                    tags=["Template"])
def get_by_id(req: Request,
              type: MailTypeEnum,
              #   user: Optional[int] = None,
              #   send: Optional[bool] = False,
              session: Session = Depends(get_session)):
    # if user:
    #     user = get_user_by_id(session=session, id=user)
    # recipient = [user.recipient]
    email = Email(recipients=[], type=type)
    # if user and send:
    #     email.send
    return email.data["Html-part"]
