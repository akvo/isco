import time
import os
import numpy as np
from typing import Optional
from uuid import uuid4
from fastapi import Form
from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi import BackgroundTasks
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from db.connection import get_session
import util.sheets as sheets
from util.cipher import Cipher
from middleware import verify_super_admin
from util.mailer import Email, MailTypeEnum

security = HTTPBearer()
download_summary_route = APIRouter()
filetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
expired_time = 5


def send_email_code(user, code):
    body = f"""<div>
            {user.name}, </br>
            Please enter this OTP to continue download:
            <h2>{code}</h2>
            <span>
            This code is valid for {expired_time} minutes.
            </span>
            </div>"""
    body_translation = f"""<div>
            {user.name},</br>
            Bitte geben Sie dieses OTP ein,
            um mit dem Herunterladen fortzufahren:
            <h2>{code}</h2>
            <span>Dieser Code ist {expired_time} Minuten lang gültig.</span>
            </div>"""
    recipients = [{"Email": user.email, "Name": user.name}]
    email = Email(
        recipients=recipients,
        body=body,
        body_translation=body_translation,
        type=MailTypeEnum.otp_code,
    )
    email.send


def delete_temporary(filename: str):
    # WHEN TO DELETE
    time.sleep(expired_time * 60)
    location = f"./tmp/{filename}.xlsx"
    if os.path.exists(location):
        os.remove(location)


@download_summary_route.post(
    "/download-summary/new",
    summary="Generate Summary File",
    response_model=dict,
    name="download_summary:generate",
    tags=["Download"],
)
async def new_summary_file(
    req: Request,
    background_tasks: BackgroundTasks,
    form_id: int,
    member_type: Optional[int] = None,
    isco_type: Optional[int] = None,
    organisation_id: Optional[int] = None,
    monitoring_round: Optional[int] = None,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    TESTING = os.environ.get("TESTING")
    user = verify_super_admin(
        session=session, authenticated=req.state.authenticated
    )
    uuid = str(uuid4()).replace("-", "")
    code = np.random.randint(100000, 999999)
    file_id = Cipher(f"{uuid}-{code}").encode()
    sheets.generate_summary(
        session=session,
        filename=file_id,
        form_id=form_id,
        user_org=user.organisation,
        member_type=member_type,
        isco_type=isco_type,
        organisation_id=organisation_id,
        show_comment=True,
        monitoring_round=monitoring_round,
    )
    if TESTING:
        return {"uuid": uuid, "code": code}
    background_tasks.add_task(delete_temporary, file_id)
    send_email_code(user=user, code=code)
    return {"uuid": uuid}


@download_summary_route.post(
    "/download-summary/file/{uuid:path}",
    summary="Download Summary File",
    response_model=str,
    name="download_summary:file",
    tags=["Download"],
)
def get_summary_file(
    req: Request,
    uuid: str,
    code: str = Form(...),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    verify_super_admin(session=session, authenticated=req.state.authenticated)
    file_id = Cipher(f"{uuid}-{code}").encode()
    filename = f"summary-{uuid}.xlsx"
    location = f"./tmp/{file_id}.xlsx"
    if not os.path.exists(location):
        raise HTTPException(status_code=404, detail="Link is Expired")
    return FileResponse(path=location, filename=filename, media_type=filetype)
