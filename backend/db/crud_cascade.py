from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.cascade import Cascade, CascadeBase
from models.cascade import CascadeDict, CascadePayload
from models.cascade_list import CascadeList, CascadeListBase
from models.cascade_list import CascadeListDict, CascadeListPayload


# Cascade


def add_cascade(session: Session,
                payload: CascadePayload):
    cascade = Cascade(id=None, name=payload['name'], type=payload['type'])
    if payload['cascades']:
        for cl in payload['cascades']:
            cid = cl['cascade']
            cid = None if cid is None else cid
            clist = CascadeList(cascade=cid,
                                parent=cl['parent'],
                                code=cl['code'],
                                name=cl['name'],
                                path=cl['path'],
                                level=cl['level'])
            cascade.cascades.append(clist)
    session.add(cascade)
    session.commit()
    session.flush()
    session.refresh(cascade)
    return cascade


def get_cascade(session: Session) -> List[CascadeDict]:
    return session.query(Cascade).all()


def get_cascade_by_id(session: Session, id: int) -> CascadeBase:
    cascade = session.query(Cascade).filter(Cascade.id == id).first()
    if cascade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"cascade {id} not found")
    return cascade


def update_cascade(session: Session,
                   id: int, payload: CascadePayload) -> CascadeDict:
    cascade = get_cascade_by_id(session=session, id=id)
    cascade.name = payload['name']
    cascade.type = payload['type']
    session.commit()
    session.flush()
    session.refresh(cascade)
    return cascade


def delete_cascade(session: Session, id: int):
    cascade = get_cascade_by_id(session=session, id=id)
    session.delete(cascade)
    session.commit()
    session.flush()


# Cascade List


def add_cascade_list(session: Session, payload: CascadeListPayload):
    clist = CascadeList(cascade=payload['cascade'],
                        parent=payload['parent'],
                        code=payload['code'],
                        name=payload['name'],
                        path=payload['path'],
                        level=payload['level'])
    session.add(clist)
    session.commit()
    session.flush()
    session.refresh(clist)
    return clist


def get_cascade_list_by_id(session: Session, id: int) -> CascadeListDict:
    clist = session.query(CascadeList).filter(CascadeList.id == id).first()
    if clist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"cascade list {id} not found")
    return clist


def update_cascade_list(session: Session, id: int,
                        payload: CascadeListPayload) -> CascadeListBase:
    clist = get_cascade_list_by_id(session=session, id=id)
    clist.cascade = payload['cascade']
    clist.parent = payload['parent']
    clist.code = payload['code']
    clist.name = payload['name']
    clist.path = payload['path']
    clist.level = payload['level']
    session.commit()
    session.flush()
    session.refresh(clist)
    return clist


def delete_cascade_list(session: Session, id: int):
    clist = get_cascade_list_by_id(session=session, id=id)
    session.delete(clist)
    session.commit()
    session.flush()
