from math import ceil
from fastapi import Depends, Request, APIRouter, HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from sqlalchemy.orm import Session
from db import crud_form
from db.connection import get_session
import db.crud_download as crud
import db.crud_data as crud_data
import util.report as report
from models.data import DataSubmittedResponse
from middleware import verify_user

security = HTTPBearer()
download_route = APIRouter()


@download_route.get("/download/list",
                    response_model=DataSubmittedResponse,
                    summary="get data list by user organisation",
                    name="download:list",
                    tags=["Download"])
def get_submitted_data_by_organisation(
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
    return {
        'current': page,
        'data': [d.simplified for d in data],
        'total': total_data,
        'total_page': total_page,
    }


@download_route.get("/download/new/{data_id:path}",
                    summary="new request download by data id",
                    name="download:request_download_data",
                    tags=["Download"])
def request_download_data(req: Request,
                          data_id: int,
                          session: Session = Depends(get_session),
                          credentials: credentials = Depends(security)):
    user = verify_user(session=session, authenticated=req.state.authenticated)
    data = crud_data.get_data_by_id(session=session, id=data_id)
    data = data.to_report
    answers = report.transform_data(answers=data["answer"], session=session)
    form = crud_form.get_form_by_id(session=session, id=data["form"])
    file = report.generate(data=answers, form=form)
    crud.new_download(session=session,
                      user=user.id,
                      form=data["form"],
                      data=data_id,
                      file=file)
    return file
