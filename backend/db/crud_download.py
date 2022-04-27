from sqlalchemy.orm import Session
from models.download import Download


def new_download(session: Session, user: int, form: int, data: int,
                 file: str) -> None:
    download = Download(form=form, data=data, request_by=user, file=file)
    session.add(download)
    session.commit()
    session.flush()
    session.refresh(download)
    return
