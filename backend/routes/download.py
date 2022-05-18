import operator
from math import ceil
from typing import List
from datetime import datetime
from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from db.connection import get_session
import db.crud_download as crud
import db.crud_data as crud_data
import db.crud_user as crud_user
from util.survey_config import MEMBER_SURVEY, PROJECT_SURVEY
import db.crud_organisation as crud_organisation
import util.report as report
import util.storage as storage
from models.download import DataDownloadDict, DownloadResponse
from models.download import DownloadRequestedResponse, DownloadRequestedDict
from models.form import FormType
from middleware import verify_user, find_secretariat_admins
from middleware import verify_super_admin, organisations_in_same_isco
from util.mailer import Email, MailTypeEnum

security = HTTPBearer()
download_route = APIRouter()


@download_route.get("/download/list",
                    response_model=List[DataDownloadDict],
                    summary="get data list by user organisation",
                    name="download:list",
                    tags=["Download"])
def get_available_downloads(req: Request,
                            session: Session = Depends(get_session),
                            credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    # get saved data from logged user organisation
    data = crud_data.get_data_by_organisation(session=session,
                                              organisation=user.organisation,
                                              submitted=True)
    if data:
        data = [d.simplified for d in data]
    else:
        data = []
    storage_files = storage.get_files(f"old_html/{user.organisation}_")
    storage_files = list(filter(lambda x: ".html" in x, storage_files))
    old_data = []
    for sf in storage_files:
        data_object = sf.replace(".html", "").split("/")[2].split("_")
        old_data.append({
            "created": data_object[0],
            "created_by": data_object[4],
            "expired": None,
            "form": data_object[3].replace("-", " ").title(),
            "form_type": data_object[1],
            "id": int(data_object[4]),
            "name": "",
            "organisation": user.organisation,
            "status": None,
            "submitted": data_object[0],
            "submitted_by": data_object[3],
            "uuid": None,
        })
    old_data.sort(key=operator.itemgetter('created'), reverse=True)
    data += old_data
    for d in data:
        download = crud.get_status(session=session, user=user.id, data=d["id"])
        status = None
        uuid = None
        expired = None
        if download:
            download = download.check_download_list
            status = download['status']
            uuid = download['uuid']
            expired = download['expired']
        d.update({"status": status})
        d.update({"uuid": uuid})
        d.update({"expired": expired})
    return data


@download_route.get("/download/requested",
                    summary="requested data download filter by same isco",
                    response_model=DownloadRequestedResponse,
                    name="download:requested_list",
                    tags=["Download"])
def requested_download_list(req: Request,
                            page: int = 1,
                            page_size: int = 10,
                            session: Session = Depends(get_session),
                            credentials: credentials = Depends(security)):
    admin = verify_super_admin(session=session,
                               authenticated=req.state.authenticated)
    data = crud.get_requested_download_list(session=session,
                                            organisation=admin.organisation,
                                            page=page,
                                            page_size=page_size)
    total_data = data['count']
    data = data['downloads']
    if not data:
        return []
    total_page = ceil(total_data / page_size) if total_data > 0 else 0
    if total_page < page:
        raise HTTPException(status_code=404, detail="Not found")
    data = [d.list_of_download_request for d in data]
    return {
        'current': page,
        'data': data,
        'total': total_data,
        'total_page': total_page,
    }


@download_route.post("/download/new/{data_id:path}",
                     summary="new request download by data id",
                     response_model=DownloadResponse,
                     status_code=201,
                     name="download:request",
                     tags=["Download"])
def request_new_download(req: Request,
                         data_id: int,
                         session: Session = Depends(get_session),
                         credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    data = crud_data.get_data_by_id(session=session, id=data_id)
    if not data:
        sf = storage.get_files(f"old_html/{user.organisation}_")
        file = list(filter(lambda x: str(data_id) in x, sf))
        if len(file) == 0:
            raise HTTPException(status_code=404, detail="Not found")
        data_object = file[0].replace(".html", "").split("/")[2].split("_")
        download = crud.new_download(session=session,
                                     user=user.id,
                                     data=data_id,
                                     form_type=data_object[1],
                                     organisation=user.organisation,
                                     file=file[0])
        return download.response
    data = data.to_report
    data = report.get_cascade_value(data=data, session=session)
    detail = report.transform_data(answers=data["answer"], session=session)
    file = report.generate(data=data, detail=detail)
    form_type = None
    if data["form"]["id"] in MEMBER_SURVEY:
        form_type = FormType.member
    if data["form"]["id"] in PROJECT_SURVEY:
        form_type = FormType.project
    download = crud.new_download(session=session,
                                 user=user.id,
                                 data=data["id"],
                                 form_type=form_type,
                                 organisation=data["organisation"]["id"],
                                 file=file)
    secretariat_admins = find_secretariat_admins(
        session=session, organisation=user.organisation)
    if download and secretariat_admins:
        organisation = crud_organisation.get_organisation_by_id(
            session=session, id=user.organisation)
        body = f'''<div>
                {user.name} ({organisation.name}) has requested for a data
                download. Please review the download file in the tool and
                approve. The user will then receive a notification.
                </div>'''
        body_translation = f'''<div>
                {user.name} ({organisation.name}) hat einen Datendownload
                angefordert. Bitte überprüfen Sie die heruntergeladene Datei
                im Tool und genehmigen Sie diese. Der Benutzer wird dann eine
                Benachrichtigung erhalten.
                </div>'''
        email = Email(recipients=[a.recipient for a in secretariat_admins],
                      body=body,
                      body_translation=body_translation,
                      type=MailTypeEnum.data_download_requested)
        email.send
    return download.response


@download_route.get("/download/view/{uuid}",
                    summary="view requested download file",
                    response_model=str,
                    name="download:view",
                    tags=["Download"])
def view_requested_download(req: Request,
                            uuid: str,
                            session: Session = Depends(get_session),
                            credentials: credentials = Depends(security)):
    admin = verify_super_admin(session=session,
                               authenticated=req.state.authenticated)
    org_ids = organisations_in_same_isco(session=session,
                                         organisation=admin.organisation)
    download = crud.get_by_uuid(session=session, uuid=uuid)
    if download and download.organisation not in org_ids:
        raise HTTPException(status_code=403, detail="Forbidden access")
    location = storage.download(url=download.file)
    return FileResponse(location)


@download_route.get("/download/file/{uuid}",
                    summary="view requested download file",
                    response_model=dict,
                    name="download:file",
                    tags=["Download"])
def get_download_file(req: Request,
                      uuid: str,
                      session: Session = Depends(get_session),
                      credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    download = crud.get_by_uuid(session=session, uuid=uuid)
    if download and download.request_by != user.id and download.expired:
        raise HTTPException(status_code=403, detail="Forbidden access")
    now = datetime.utcnow()
    if download and now > download.expired:
        raise HTTPException(status_code=410, detail="Expired")
    location = storage.download(url=download.file)
    return FileResponse(location)


@download_route.put("/download/{uuid:path}",
                    summary="approve or reject download request",
                    response_model=DownloadRequestedDict,
                    name="download:update",
                    tags=["Download"])
def update_download_status(req: Request,
                           uuid: str,
                           approved: bool,
                           session: Session = Depends(get_session),
                           credentials: credentials = Depends(security)):
    admin = verify_super_admin(session=session,
                               authenticated=req.state.authenticated)
    org_ids = organisations_in_same_isco(session=session,
                                         organisation=admin.organisation)
    data = crud.get_by_uuid(session=session, uuid=uuid)
    # validate secretariat admin
    if data and data.organisation not in org_ids:
        raise HTTPException(status_code=403, detail="Forbidden access")
    update = crud.update_download(session=session,
                                  uuid=uuid,
                                  approved_by=admin.id,
                                  approved=approved)
    # TODO:: Send rejected email
    user = crud_user.get_user_by_id(session=session, id=data.request_by)
    if user and approved:
        email = Email(recipients=[user.recipient],
                      type=MailTypeEnum.data_download_approved)
        email.send
    return update.list_of_download_request
