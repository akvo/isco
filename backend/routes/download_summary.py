from typing import Optional
from uuid import uuid4
from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from db.connection import get_session
import util.sheets as sheets
from middleware import verify_user

security = HTTPBearer()
download_summary_route = APIRouter()
filetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


@download_summary_route.post("/download-summary/new",
                             summary="Generate Summary File",
                             response_model=str,
                             name="download_summary:generate",
                             tags=["Download"])
def get_download_file(req: Request,
                      form_id: int,
                      member_type: Optional[int] = None,
                      session: Session = Depends(get_session),
                      credentials: credentials = Depends(security)):
    verify_user(session=session, authenticated=req.state.authenticated)
    file_id = "-".join(str(uuid4()).split('-')[1:4])
    filename = f"summary-{file_id}.xlsx"
    location = sheets.generate_summary(session=session,
                                       filename=filename,
                                       form_id=form_id,
                                       member_type=member_type)
    return FileResponse(path=location, filename=filename, media_type=filetype)
