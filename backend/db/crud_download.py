from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.download import Download, DownloadStatusType
from models.download import DownloadRequestedDict
from middleware import organisations_in_same_isco


def new_download(session: Session, user: int, form: int, data: int,
                 organisation: int, file: str) -> None:
    download = Download(form=form,
                        data=data,
                        organisation=organisation,
                        request_by=user,
                        file=file)
    session.add(download)
    session.commit()
    session.flush()
    session.refresh(download)
    return download


def get_status(session: Session, user: int, data: int) -> DownloadStatusType:
    download = session.query(Download).filter(
        and_(Download.data == data, Download.request_by == user)).first()
    if download:
        if download.approved_by:
            return DownloadStatusType.approved
        return DownloadStatusType.pending
    return None


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
