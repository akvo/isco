import json
import db.crud_option as crud_option
import util.storage as storage
from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from models.form import Form, FormDict, FormBase, FormPayload
from models.question_group import QuestionGroup
from models.question import QuestionType, RepeatingObjectType
from db.crud_question_group import delete_question_by_group
from db.crud_cascade import get_cascade_list_by_cascade_id
from models.skip_logic import OperatorType
from datetime import datetime


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


def get_order(data):
    return data['order']


def generate_webform_json(session: Session, id: int):
    form = get_form_by_id(session=session, id=id)
    form = form.serializeJson
    cascade_ids = []
    # add default lang into form languages
    default_lang = ["en"]
    if "languages" in form:
        for lang in form["languages"]:
            default_lang.append(lang)
        form['languages'] = default_lang
    # Sort question group by order
    form['question_group'].sort(key=get_order)
    for qg in form['question_group']:
        # Sort question by order
        qg['question'].sort(key=get_order)
        for q in qg['question']:
            if 'option' in q:
                # Sort option by order
                q['option'].sort(key=get_order)
            # need to do transform for cascade / send api
            if q['type'] == QuestionType.cascade.value:
                # need to change URL/api
                q.update({
                    "api": {
                        "endpoint": f"URL/api/cascade/list/{q['cascade']}",
                        "initial": 0,
                        "list": False,
                    }
                })
            # need to dp transform for nested_list
            if q['type'] == QuestionType.nested_list.value:
                # get tree
                cascade_ids.append(q['cascade'])
                name = f"tree_{q['cascade']}"
                q['type'] = "tree"
                q['option'] = name
            if 'repeating_objects' in q and q['repeating_objects']:
                for r in q['repeating_objects']:
                    if r['field'] == RepeatingObjectType.unit.value:
                        q['addonAfter'] = r['value']
                del q['repeating_objects']
            if 'dependency' in q:
                # Transform dependency
                for d in q['dependency']:
                    d.update({"id": d['dependent_to']})
                    if d['type'] == QuestionType.option.value:
                        ids = d['value'].split('|')
                        option = crud_option.get_option_by_ids(
                            session=session, ids=ids)
                        option = [opt.optionName for opt in option]
                        d.update({"options": option})
                    if d['type'] == QuestionType.number.value:
                        d['value'] = int(d['value'])
                        operator = d['operator']
                        if d['operator'] == OperatorType.greater_than:
                            operator = "min"
                        if d['operator'] == OperatorType.greater_than_or_equal:
                            operator = "min"
                        if d['operator'] == OperatorType.less_than:
                            operator = "max"
                        if d['operator'] == OperatorType.less_than_or_equal:
                            operator = "max"
                        d.update({operator: d['value']})
                    del d['id']
                    del d['operator']
                    del d['value']
                    del d['type']
    # fetch nested list / tree data
    if len(cascade_ids):
        tree_obj = get_cascade_list_by_cascade_id(session=session,
                                                  cascade_id=cascade_ids)
        if tree_obj:
            form.update({"tree": tree_obj})

    return form


def generate_webform_json_file(session: Session, id: int,
                               version: Optional[float] = None):
    form = generate_webform_json(session=session, id=id)
    form_name = form['name'].lower().split(" ")
    form_name = "_".join(form_name)
    version_number = form['version']
    version_number = version_number if version_number else 0
    version_number = version_number + 1
    if version:
        version_number = version
    filename = f"{id}_{form_name}_v{version_number}.json"
    filepath = f"./tmp/{filename}"
    with open(filepath, "w") as outfile:
        json.dump(form, outfile)
    return filepath


def publish_form(session: Session, id: int):
    form = get_form_by_id(session=session, id=id)
    # generate version
    version = form.version
    version = version if version else 0
    version = version + 1
    # generate and upload file to bucket
    filepath = generate_webform_json_file(
        session=session, id=id, version=version)
    upload = storage.upload(
        file=filepath, folder="forms", public=True)
    # update form version
    form.version = version
    form.url = upload
    form.published = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%-S")
    session.commit()
    session.flush()
    session.refresh(form)
    return form


def delete_publish_form(session: Session, id: int):
    form = get_form_by_id(session=session, id=id)
    # delete
    url = form.url
    delete = storage.delete(url)
    # update form version
    if delete:
        form.version = None
        form.url = None
        form.published = None
    session.commit()
    session.flush()
    session.refresh(form)
    return form
