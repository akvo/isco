from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.download import Download, DownloadStatusType


def new_download(session: Session, user: int, form: int, data: int,
                 file: str) -> None:
    download = Download(form=form, data=data, request_by=user, file=file)
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
