from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.form import Form, FormDict, FormBase


def add_form(session: Session, payload: FormDict):
    form = Form(id=None, name=payload['name'], languages=payload['languages'])
    session.add(form)
    session.commit()
    session.flush()
    session.refresh(form)
    return form


def get_form(session: Session) -> List[FormDict]:
    return session.query(Form).all()


def get_form_by_id(session: Session, id: int) -> FormBase:
    return session.query(Form).filter(Form.id == id).first()


def update_form(session: Session, id: int, payload: FormDict) -> FormDict:
    form = session.query(Form).filter(Form.id == id).first()
    if form is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"form {id} not found")
    form.name = payload['name']
    form.languages = payload['languages']
    session.commit()
    session.flush()
    session.refresh(form)
    return form


def delete_form(session: Session, id: int) -> FormDict:
    form = get_form_by_id(session=session, id=id)
    session.delete(form)
    session.commit()
    session.flush()
