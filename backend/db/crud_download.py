from uuid import uuid4
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.download import Download, DownloadRequestedDict, DownloadStatusType
from models.form import FormType
from middleware import organisations_in_same_isco


def new_download(
    session: Session,
    user: int,
    data: int,
    organisation: int,
    file: str,
    form_type: Optional[FormType] = None,
) -> None:
    download = Download(
        form_type=form_type,
        uuid=str(uuid4()),
        data=data,
        organisation=organisation,
        request_by=user,
        file=file,
    )
    session.add(download)
    session.commit()
    session.flush()
    session.refresh(download)
    return download


def update_download(
    session: Session, uuid: str, approved_by: int, approved: bool
) -> DownloadRequestedDict:
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
    download = (
        session.query(Download)
        .filter(and_(Download.data == data, Download.request_by == user))
        .order_by(Download.id.desc())
        .order_by(Download.created.desc())
        .first()
    )
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


def get_requested_download_list(
    session: Session,
    admin_organisation: int,
    page: int,
    page_size: int,
    organisation_filter: Optional[int] = None,
    status: Optional[DownloadStatusType] = None,
) -> DownloadRequestedDict:
    org_ids = organisations_in_same_isco(
        session=session, organisation=admin_organisation
    )
    downloads = session.query(Download).filter(
        Download.organisation.in_(org_ids)
    )

    if organisation_filter:
        downloads = downloads.filter(
            Download.organisation == organisation_filter
        )

    # Status filtering:
    # 1. pending approval == [status pending]
    # 2. approved == [status approved]
    # 4. All = None

    # FILTER DOWNLOAD BY STATUS
    # # pending
    status_value = status.value if status else None
    if status_value == DownloadStatusType.pending.value:
        downloads = downloads.filter(
            and_(Download.uuid.isnot(None), Download.approved_by.is_(None))
        )
    # approved
    if status_value == DownloadStatusType.approved.value:
        downloads = downloads.filter(
            and_(
                Download.uuid.isnot(None),
                Download.approved_by.isnot(None),
                Download.expired.isnot(None),
            )
        )
    # EOL FILTER DOWNLOAD BY STATUS
    res = downloads.limit(page_size).offset((page - 1) * page_size)
    return {"downloads": res, "count": downloads.count()}
