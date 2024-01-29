from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from models.question_group import QuestionGroupPayload, QuestionGroupDict
from models.question_group import QuestionGroup, QuestionGroupBase
from models.question_group_member_access import QuestionGroupMemberAccess
from models.question_group_isco_access import QuestionGroupIscoAccess
from models.question import Question, QuestionType
from models.question_member_access import QuestionMemberAccess
from models.question_isco_access import QuestionIscoAccess
from models.option import Option
from db.crud_question import add_question, delete_question_by_group
from db.crud_question import reorder_question


def add_question_group(
    session: Session, payload: QuestionGroupPayload
) -> QuestionGroupBase:
    question_group = QuestionGroup(
        id=None,
        name=payload["name"],
        description=payload["description"],
        form=payload["form"],
        order=payload["order"],
        translations=payload["translations"],
        repeat=payload["repeat"],
        repeat_text=payload["repeat_text"],
    )
    if payload["member_access"]:
        for ma in payload["member_access"]:
            member = QuestionGroupMemberAccess(
                id=None, question_group=None, member_type=ma
            )
            question_group.member_access.append(member)

    if payload["isco_access"]:
        for ia in payload["isco_access"]:
            isco = QuestionGroupIscoAccess(
                id=None, question_group=None, isco_type=ia
            )
            question_group.isco_access.append(isco)

    session.add(question_group)
    session.commit()
    session.flush()
    session.refresh(question_group)

    if payload["question"]:
        for q in payload["question"]:
            q["form"] = (question_group.form,)
            q["question_group"] = question_group.id
            add_question(
                session=session,
                payload=q,
                member_access=payload["member_access"],
                isco_access=payload["isco_access"],
            )

    return question_group


def get_question_group(session: Session) -> List[QuestionGroupDict]:
    return session.query(QuestionGroup).all()


def get_question_group_by_id(session: Session, id: int) -> QuestionGroupBase:
    question_group = (
        session.query(QuestionGroup).filter(QuestionGroup.id == id).first()
    )
    if question_group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"question group {id} not found",
        )
    return question_group


def update_question_group(
    session: Session, id: int, payload: QuestionGroupPayload
) -> QuestionGroupBase:
    question_group = get_question_group_by_id(session=session, id=id)
    question_group.form = payload["form"]
    question_group.name = payload["name"]
    question_group.description = payload["description"]
    question_group.order = payload["order"]
    question_group.translations = payload["translations"]
    question_group.repeat = payload["repeat"]
    question_group.repeat_text = payload["repeat_text"]
    # Add member access
    if payload["member_access"]:
        delete_member_access_by_group_id(session=session, question_group=[id])
        for ma in payload["member_access"]:
            member = QuestionGroupMemberAccess(
                id=None, question_group=None, member_type=ma
            )
            question_group.member_access.append(member)
    # Add isco access
    if payload["isco_access"]:
        delete_isco_access_by_group_id(session=session, question_group=[id])
        for ia in payload["isco_access"]:
            isco = QuestionGroupIscoAccess(
                id=None, question_group=None, isco_type=ia
            )
            question_group.isco_access.append(isco)

    session.commit()
    session.flush()
    session.refresh(question_group)
    return question_group


def move_question_group(
    session: Session,
    id: int,
    selected_order: int,
    target_order: int,
    target_id: int,
):
    # validate negative order value
    if selected_order <= 0 or target_order <= 0:
        raise HTTPException(
            status_code=501,
            detail="MOVE GROUP A | question group has negative order value",
        )

    group = session.query(QuestionGroup).filter(QuestionGroup.id == id).first()
    groups = session.query(QuestionGroup)

    if selected_order > target_order:
        group.order = target_order
        groups = groups.filter(
            and_(
                QuestionGroup.form == group.form,
                QuestionGroup.order >= target_order,
                QuestionGroup.order != selected_order,
                QuestionGroup.order < selected_order,
                QuestionGroup.id != id,
            )
        )
        # update question between group
        between_group = (
            session.query(QuestionGroup)
            .filter(
                and_(
                    QuestionGroup.form == group.form,
                    QuestionGroup.order <= selected_order,
                    QuestionGroup.order >= target_order,
                )
            )
            .all()
        )
        between_group_ids = [bg.id for bg in between_group]
        between_question = (
            session.query(Question)
            .filter(Question.question_group.in_(between_group_ids))
            .all()
        )
        # selected question
        selected_q = (
            session.query(Question)
            .filter(Question.question_group == id)
            .order_by(Question.order)
            .all()
        )
        selected_q_length = len(selected_q)
        for bq in between_question:
            bq.order = bq.order + selected_q_length
        # validate negative order value
        q_orders = any(q.order <= 0 for q in between_question)
        if q_orders:
            raise HTTPException(
                status_code=501,
                detail="MOVE GROUP B | question has negative order value",
            )
        # update question inside selected/moved group
        prev_order = (
            session.query(Question)
            .filter(Question.question_group == target_id)
            .order_by(Question.order.desc())
            .first()
            .order
        )
        for index, sq in enumerate(selected_q):
            if target_order <= 1:
                sq.order = index + 1
            else:
                sq.order = index + prev_order + 1
        # validate negative order value
        q_orders = any(q.order <= 0 for q in selected_q)
        if q_orders:
            raise HTTPException(
                status_code=501,
                detail="MOVE GROUP C | question has negative order value",
            )

    if selected_order < target_order:
        group.order = target_order - 1
        groups = groups.filter(
            and_(
                QuestionGroup.form == group.form,
                QuestionGroup.order > selected_order,
                QuestionGroup.order < target_order,
                QuestionGroup.order != selected_order,
                QuestionGroup.id != id,
            )
        )
        # update question between group
        between_group = (
            session.query(QuestionGroup)
            .filter(
                and_(
                    QuestionGroup.form == group.form,
                    QuestionGroup.order < target_order,
                    QuestionGroup.order >= selected_order,
                )
            )
            .all()
        )
        between_group_ids = [bg.id for bg in between_group]
        between_question = (
            session.query(Question)
            .filter(Question.question_group.in_(between_group_ids))
            .all()
        )
        # selected question
        selected_q = (
            session.query(Question)
            .filter(Question.question_group == id)
            .order_by(Question.order)
            .all()
        )
        selected_q_length = len(selected_q)
        for bq in between_question:
            bq.order = bq.order - selected_q_length
        # update question inside selected/moved group
        moved_group = (
            session.query(QuestionGroup)
            .filter(
                and_(
                    QuestionGroup.form == group.form,
                    QuestionGroup.order >= selected_order,
                    QuestionGroup.order < target_order,
                )
            )
            .all()
        )
        moved_group_ids = [mg.id for mg in moved_group]
        moved_q = (
            session.query(Question)
            .filter(Question.question_group.in_(moved_group_ids))
            .all()
        )
        moved_q_length = len(moved_q)
        for q in selected_q:
            q.order = q.order + moved_q_length
        # validate negative order value
        q_orders = any(q.order <= 0 for q in selected_q)
        if q_orders:
            raise HTTPException(
                status_code=501,
                detail="MOVE GROUP D | question has negative order value",
            )

    groups = groups.order_by(QuestionGroup.order).all()
    for qg in groups:
        if selected_order > target_order:
            qg.order = qg.order + 1
        if selected_order < target_order:
            qg.order = qg.order - 1
    # validate negative order value
    qg_orders = any(qg.order <= 0 for qg in groups)
    if qg_orders:
        raise HTTPException(
            status_code=501,
            detail="MOVE GROUP B | question has negative order value",
        )
    session.commit()
    session.flush()


def copy_question_group(
    session: Session,
    id: int,
    selected_order: int,
    target_order: int,
    # target_id: int,
):
    # validate negative order value
    if selected_order <= 0 or target_order <= 0:
        raise HTTPException(
            status_code=501,
            detail="COPY GROUP A | question group has negative order value",
        )

    # current group
    group = session.query(QuestionGroup).filter(QuestionGroup.id == id).first()

    # handle copy to before/after position to determine new qg order
    new_group_order = group.order
    if selected_order > target_order:
        new_group_order = target_order
    if selected_order < target_order:
        new_group_order = target_order - 1

    # clone question group
    new_group = QuestionGroup(
        id=None,
        name=group.name,
        description=group.description,
        form=group.form,
        order=new_group_order,
        translations=group.translations,
        repeat=group.repeat,
        repeat_text=group.repeat_text,
    )

    # handle question group member/isco access
    # question_group_member_access
    qgmas = (
        session.query(QuestionGroupMemberAccess)
        .filter(QuestionGroupMemberAccess.question_group == group.id)
        .all()
    )
    for qgma in qgmas:
        new_qgma = QuestionGroupMemberAccess(
            id=None, member_type=qgma.member_type, question_group=None
        )
        new_group.member_access.append(new_qgma)
    # question_group_isco_access
    qgias = (
        session.query(QuestionGroupIscoAccess)
        .filter(QuestionGroupIscoAccess.question_group == group.id)
        .all()
    )
    for qgia in qgias:
        new_qgia = QuestionGroupIscoAccess(
            id=None, isco_type=qgia.isco_type, question_group=new_group.id
        )
        new_group.isco_access.append(new_qgia)

    # last question order from new position
    prev_group = (
        session.query(QuestionGroup)
        .filter(
            and_(
                QuestionGroup.form == group.form,
                QuestionGroup.order == new_group_order - 1,
            )
        )
        .first()
    )
    last_question_order = 0
    if prev_group:
        last_question = (
            session.query(Question)
            .filter(Question.question_group == prev_group.id)
            .order_by(desc(Question.order))
            .first()
        )
        last_question_order = last_question.order if last_question else 0

    # selected question / copied questions inside group
    selected_q = (
        session.query(Question)
        .filter(Question.question_group == id)
        .order_by(Question.order)
        .all()
    )

    # add new group (copy)
    new_group.order = new_group_order
    session.add(new_group)
    session.commit()

    # duplicate questions
    new_q_orders = []
    new_order = 0
    for qi, q in enumerate(selected_q):
        new_order = last_question_order + qi + 1
        new_q = Question(
            id=None,
            form=q.form,
            question_group=new_group.id,
            name=q.name,
            translations=q.translations,
            mandatory=q.mandatory,
            datapoint_name=q.datapoint_name,
            variable_name=q.variable_name,
            type=q.type,
            personal_data=q.personal_data,
            rule=q.rule,
            tooltip=q.tooltip,
            tooltip_translations=q.tooltip_translations,
            cascade=q.cascade,
            repeating_objects=q.repeating_objects,
            order=new_order,
            core_mandatory=q.core_mandatory,
            deactivate=q.deactivate,
            autofield=q.autofield,
        )
        new_q_orders.append(new_order)
        # handle question member/isco access
        # question_member_access
        qmas = (
            session.query(QuestionMemberAccess)
            .filter(QuestionMemberAccess.question == q.id)
            .all()
        )
        for qma in qmas:
            new_qma = QuestionMemberAccess(
                id=None, member_type=qma.member_type, question=None
            )
            new_q.member_access.append(new_qma)
        # question_isco_access
        qias = (
            session.query(QuestionIscoAccess)
            .filter(QuestionIscoAccess.question == q.id)
            .all()
        )
        for qia in qias:
            new_qia = QuestionIscoAccess(
                id=None, isco_type=qia.isco_type, question=None
            )
            new_q.isco_access.append(new_qia)

        # handle copy options/multiple options
        if q.type in [QuestionType.option, QuestionType.multiple_option]:
            options = (
                session.query(Option).filter(Option.question == q.id).all()
            )
            for opt in options:
                new_opt = Option(
                    id=None,
                    code=opt.code,
                    name=opt.name,
                    question=None,
                    order=opt.order,
                    translations=opt.translations,
                )
                new_q.option.append(new_opt)
        session.add(new_q)
        session.commit()
    # validate negative order value
    q_orders = any(order <= 0 for order in new_q_orders)
    if q_orders:
        raise HTTPException(
            status_code=501,
            detail="COPY GROUP B | question has negative order value",
        )

    # update after copied position
    after_group = (
        session.query(QuestionGroup)
        .filter(
            and_(
                QuestionGroup.form == group.form,
                QuestionGroup.order >= new_group.order,
                QuestionGroup.id != new_group.id,
            )
        )
        .order_by(QuestionGroup.order)
        .all()
    )
    for qgi, qg in enumerate(after_group):
        qg.order = new_group.order + qgi + 1
    # validate negative order value
    qg_orders = any(qg.order <= 0 for qg in after_group)
    if qg_orders:
        raise HTTPException(
            status_code=501,
            detail="COPY GROUP C | question has negative order value",
        )
    after_group_ids = [bg.id for bg in after_group]
    after_questions = (
        session.query(Question)
        .filter(Question.question_group.in_(after_group_ids))
        .order_by(Question.order)
        .all()
    )
    for aqi, aq in enumerate(after_questions):
        aq.order = new_order + aqi + 1
    # validate negative order value
    q_orders = any(q.order <= 0 for q in after_questions)
    if q_orders:
        raise HTTPException(
            status_code=501,
            detail="COPY GROUP D | question has negative order value",
        )
    session.commit()
    session.flush()
    return group


def get_member_access_by_question_group_id(
    session: Session, question_group: List[int]
) -> List:
    member_access = session.query(QuestionGroupMemberAccess).filter(
        QuestionGroupMemberAccess.question_group.in_(question_group)
    )
    return member_access


def delete_member_access_by_group_id(
    session: Session, question_group: List[int]
):
    # check if exist
    member_access = get_member_access_by_question_group_id(
        session=session, question_group=question_group
    )
    if member_access:
        # delete
        member_access.delete(False)
        session.commit()
        session.flush()
    return member_access


def get_isco_access_by_question_group_id(
    session: Session, question_group: List[int]
) -> List:
    isco_access = session.query(QuestionGroupIscoAccess).filter(
        QuestionGroupIscoAccess.question_group.in_(question_group)
    )
    return isco_access


def delete_isco_access_by_group_id(
    session: Session, question_group: List[int]
):
    # check if exist
    isco_access = get_isco_access_by_question_group_id(
        session=session, question_group=question_group
    )
    if isco_access:
        # delete
        isco_access.delete(False)
        session.commit()
        session.flush()
    return isco_access


def reorder_question_group(
    session: Session,
    form: int,
    exclude: Optional[int] = None,
    only: Optional[List[int]] = None,
    order: Optional[int] = 1,
):
    if not exclude and not only:
        return False
    groups = session.query(QuestionGroup).filter(QuestionGroup.form == form)
    if exclude:
        groups = groups.filter(QuestionGroup.id != exclude)
    if only:
        groups = groups.filter(QuestionGroup.id.in_(only))
    groups = groups.order_by(QuestionGroup.order).all()
    for index, qg in enumerate(groups):
        qg.order = index + order
    return groups


def delete_question_group(session: Session, id: int):
    # delete question
    delete_question_by_group(session=session, group=[id])
    delete_member_access_by_group_id(session=session, question_group=[id])
    delete_isco_access_by_group_id(session=session, question_group=[id])
    question_group = get_question_group_by_id(session=session, id=id)
    form_id = question_group.form
    session.delete(question_group)
    reorder_question(session=session, form=form_id, question_group=id)
    reorder_question_group(session=session, form=form_id, exclude=id)
    session.commit()
    session.flush()
