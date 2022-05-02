from math import ceil
from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from db.connection import get_session
import db.crud_download as crud
import db.crud_data as crud_data
import util.report as report
from models.download import DataDownloadResponse, DownloadRequestResponse
from middleware import verify_user, find_secretariat_admins
from util.mailer import Email, MailTypeEnum

security = HTTPBearer()
download_route = APIRouter()


@download_route.get("/download/list",
                    response_model=DataDownloadResponse,
                    summary="get data list by user organisation",
                    name="download:list",
                    tags=["Download"])
def get_available_downloads(
        req: Request,
        page: int = 1,
        page_size: int = 10,
        session: Session = Depends(get_session),
        credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    # get saved data from logged user organisation
    data = crud_data.get_data_by_organisation(session=session,
                                              organisation=user.organisation,
                                              submitted=True,
                                              page=page,
                                              page_size=page_size)
    if not data:
        return []
    total_data = crud_data.count_data_by_organisation(
        session=session,
        organisation=user.organisation,
        submitted=True,
    )
    total_page = ceil(total_data / page_size) if total_data > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    data = [d.simplified for d in data]
    for d in data:
        status = crud.get_status(session=session, user=user.id, data=d["id"])
        d.update({"status": status})
    return {
        'current': page,
        'data': data,
        'total': total_data,
        'total_page': total_page,
    }


@download_route.post("/download/new/{data_id:path}",
                     summary="new request download by data id",
                     response_model=DownloadRequestResponse,
                     status_code=201,
                     name="download:request",
                     tags=["Download"])
def request_new_download(req: Request,
                         data_id: int,
                         session: Session = Depends(get_session),
                         credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    data = crud_data.get_data_by_id(session=session, id=data_id)
    data = data.to_report
    detail = report.transform_data(answers=data["answer"], session=session)
    file = report.generate(data=data, detail=detail)
    download = crud.new_download(session=session,
                                 user=user.id,
                                 data=data["id"],
                                 form=data["form"]["id"],
                                 organisation=data["organisation"]["id"],
                                 file=file)
    secretariat_admins = find_secretariat_admins(
        session=session, organisation=user.organisation)
    if download and secretariat_admins:
        email = Email(recipients=[a.recipient for a in secretariat_admins],
                      type=MailTypeEnum.data_download_requested)
        email.send
    return download.response
