from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.form import Form, FormDict, FormBase, FormPayload
from models.question_group import QuestionGroup
from db.crud_question_group import delete_question_by_group


def add_form(session: Session, payload: FormPayload):
    form = Form(id=None, name=payload['name'],
                description=payload['description'],
                languages=payload['languages'])
    session.add(form)
    session.commit()
    session.flush()
    session.refresh(form)
    return form


def get_form(session: Session) -> List[FormDict]:
    return session.query(Form).all()


def get_form_by_id(session: Session, id: int) -> FormBase:
    form = session.query(Form).filter(Form.id == id).first()
    if form is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"form {id} not found")
    return form


def update_form(session: Session, id: int, payload: FormPayload) -> FormDict:
    form = get_form_by_id(session=session, id=id)
    form.name = payload['name']
    form.description = payload['description']
    form.languages = payload['languages']
    session.commit()
    session.flush()
    session.refresh(form)
    return form


def delete_form(session: Session, id: int):
    # delete question group
    groups = session.query(QuestionGroup).filter(
        QuestionGroup.form == id).all()
    if groups:
        group_ids = [g.id for g in groups]
        delete_question_by_group(session=session, group=group_ids,
                                 dependency=False)
    form = get_form_by_id(session=session, id=id)
    session.delete(form)
    session.commit()
    session.flush()
