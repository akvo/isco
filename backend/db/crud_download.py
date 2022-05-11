from uuid import uuid4
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.download import Download, DownloadRequestedDict
from middleware import organisations_in_same_isco


def new_download(session: Session, user: int, form: int, data: int,
                 organisation: int, file: str) -> None:
    download = Download(form=form,
                        uuid=str(uuid4()),
                        data=data,
                        organisation=organisation,
                        request_by=user,
                        file=file)
    session.add(download)
    session.commit()
    session.flush()
    session.refresh(download)
    return download


def update_download(session: Session,
                    uuid: str,
                    approved_by: int,
                    approved: bool) -> DownloadRequestedDict:
    download = get_by_uuid(session=session, uuid=uuid)
    download.approved_by = approved_by
    if approved:
        download.expired = datetime.utcnow() + timedelta(days=5)
    else:
        download.expired = None
    session.commit()
    session.flush()
    session.refresh(download)
    return download


def get_status(session: Session, user: int, data: int):
    download = session.query(Download).filter(
        and_(Download.data == data, Download.request_by == user)).first()
    return download


def get_by_id(session: Session, id: int):
    download = session.query(Download).filter(Download.id == id).first()
    if not download:
        raise HTTPException(status_code=404, detail="Not found")
    return download


def get_by_uuid(session: Session, uuid: str):
    download = session.query(Download).filter(Download.uuid == uuid).first()
    if not download:
        raise HTTPException(status_code=404, detail="Not found")
    return download


def get_requested_download_list(session: Session,
                                organisation: int,
                                page: int,
                                page_size: int) -> DownloadRequestedDict:
    org_ids = organisations_in_same_isco(
        session=session, organisation=organisation)
    downloads = session.query(Download).filter(
        Download.organisation.in_(org_ids))
    res = downloads.limit(page_size).offset((page - 1) * page_size)
    return {"downloads": res, "count": downloads.count()}
