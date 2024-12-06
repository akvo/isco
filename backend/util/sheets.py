from typing import Optional
from fastapi import HTTPException
from sqlalchemy import and_, null, extract
from sqlalchemy.sql.expression import false
from sqlalchemy.orm import Session
from models.views.summary import Summary
from models.organisation_isco import OrganisationIsco
from models.organisation_member import OrganisationMember
from models.data import Data
from models.question import Question, QuestionType
from models.cascade_list import CascadeList
from middleware import organisations_in_same_isco
import pandas as pd
import math

main_sheet_name = "Index"
COMMENT_PREFIX_MARK = "Z#Z#"  # to put comment after each question


def add_order_to_name(x, order, column_name, max_order, show_comment):
    num = str(x[order])
    count = math.floor(math.log10(max_order))
    order_count = math.floor(math.log10(x[order]))
    col_name = x[column_name]
    if len(num) <= count:
        prefix = ["0" for c in range(count - order_count)]
        prefix = "".join(prefix)
        num = f"{prefix}{num}"
    if show_comment and COMMENT_PREFIX_MARK in col_name:
        num = f"{num}|comment"
        col_name = col_name.replace(COMMENT_PREFIX_MARK, "")
    return f"{num}. {col_name}"


def write_sheet(df, writer, sheet_name, show_comment=False):
    answer_col = ["answer"]
    unstack_col = ["question_group_name", "question_name"]
    cols = [
        "data_id",
        "member_id",
        "question_group_name",
        "question_name",
        "member_type",
        "submitted",
    ]

    if sheet_name != main_sheet_name:
        cols = [
            "data_id",
            "member_id",
            "question_group_name",
            "question_name",
            "repeat_index",  # ordering by question first, then index
            "member_type",
            "submitted",
        ]
        df["repeat_index"] = df["repeat_index"] + 1

    max_go = df["go"].max()
    max_qo = df["qo"].max()
    df["question_group_name"] = df.apply(
        add_order_to_name,
        order="go",
        column_name="question_group",
        max_order=max_go,
        axis=1,
        show_comment=show_comment,
    )
    df["question_name"] = df.apply(
        add_order_to_name,
        order="qo",
        column_name="question",
        max_order=max_qo,
        axis=1,
        show_comment=show_comment,
    )
    df = df[cols + answer_col]
    # replace NaN with empty string
    df = df.fillna("")
    df = df.groupby(cols).first()
    df = df.unstack(unstack_col)
    df.columns = df.columns.rename("", level=1)
    df.columns = df.columns.rename("", level=2)
    if len(sheet_name) > 20:
        sheet_name = sheet_name[:15] + "..."
    df = df[answer_col]
    # NULL REPEAT INDEX FIX
    # null repeat index because of that question doesn't have answer
    if sheet_name != main_sheet_name:
        df = df[df.index.get_level_values(1) != ""]
    # FILL IF DATAFRAME IS EMPTY
    if not df.shape[0]:
        # https://github.com/pandas-dev/pandas/issues/19543
        df.loc[tuple("" for _ in list(df.index.names)), :] = ""
    # END FIX
    df.to_excel(writer, sheet_name=sheet_name)


def generate_summary(
    session: Session,
    filename: str,
    form_id: int,
    user_org: int,
    member_type: Optional[int] = None,
    show_comment: Optional[bool] = False,
    monitoring_round: Optional[int] = None,
):
    tmp_file = f"./tmp/{filename}.xlsx"
    # find user organisation isco to filter the question
    org_isco = (
        session.query(OrganisationIsco)
        .filter(OrganisationIsco.organisation == user_org)
        .all()
    )
    isco_ids = [i.isco_type for i in org_isco]

    # find organisation in same isco to filter datapoint
    org_in_same_isco = organisations_in_same_isco(
        session=session, organisation=user_org
    )

    org_in_same_isco_member = org_in_same_isco
    # filter download data / answer by selected member type dropdown
    if member_type:
        org_in_same_isco_member_tmp = (
            session.query(OrganisationMember)
            .filter(
                and_(
                    OrganisationMember.organisation.in_(org_in_same_isco),
                    OrganisationMember.member_type == member_type,
                )
            )
            .all()
        )
        org_in_same_isco_member = [
            o.organisation for o in org_in_same_isco_member_tmp
        ]

    # find data id by organisation in same isco
    data = session.query(Data).filter(
        and_(
            Data.form == form_id,
            Data.organisation.in_(org_in_same_isco_member),
            Data.submitted != null(),
        )
    )
    if monitoring_round:
        data = data.filter(extract("year", Data.created) == monitoring_round)
    data = data.all()
    data_ids = [d.id for d in data]

    # filter question with personal data flag
    questions = session.query(Question).filter(
        and_(Question.form == form_id, Question.personal_data == false())
    )
    qids_no_personal_data = [q.id for q in questions.all()]
    # query summary view and filter by data ids and qids_no_personal_data
    summary = session.query(Summary).filter(
        and_(
            Summary.fid == form_id,
            Summary.data_id.in_(data_ids),
            Summary.qid.in_(qids_no_personal_data),
        )
    )

    # question - filter by user isco
    if isco_ids:
        isco_ids += [1]  # add all isco type
        summary = summary.filter(Summary.isco_type.overlap(isco_ids))
    # question - filter by member type dropdown
    if member_type:
        members = [1]  # add all member type
        members += [member_type]
        summary = summary.filter(Summary.member_type.overlap(members))
    else:
        summary = summary
    summary = summary.order_by(Summary.go, Summary.qo).all()
    if not summary:
        raise HTTPException(status_code=404, detail="No Data Available")
    summary = [s.serialize for s in summary]

    # fetch cascade value by answer
    questions = questions.filter(
        Question.type == QuestionType.cascade.value
    ).all()
    cascade_qids = [q.id for q in questions]
    cascade_answers = []
    for s in summary:
        if not s.get("answer") or s.get("qid") not in cascade_qids:
            continue
        cascade_answers += [int(float(x)) for x in s["answer"].split("|")]
    cascade_answers = set(cascade_answers)
    cascade_list = (
        session.query(CascadeList)
        .filter(CascadeList.id.in_(cascade_answers))
        .all()
    )
    q_cascades = {}
    for cl in cascade_list:
        q_cascades.update({cl.id: cl.name})

    # transform cascade answer value
    transform = []
    for s in summary:
        if s["qid"] in cascade_qids and s["answer"] is not None:
            cascade_list_ids = [int(float(x)) for x in s["answer"].split("|")]
            cascade_answer = []
            for cl in cascade_list_ids:
                if cl in q_cascades and q_cascades[cl]:
                    cascade_answer.append(q_cascades[cl])
            s["answer"] = (
                "|".join(cascade_answer) if cascade_answer else s["answer"]
            )
        transform.append(s)
        if show_comment:
            # add comment as new row for each question
            temp = s.copy()
            temp["question"] = f"{COMMENT_PREFIX_MARK}{s['question']}"
            temp["answer"] = s["comment"]
            transform.append(temp)

    # start create spreadsheet
    source = pd.DataFrame(transform)
    writer = pd.ExcelWriter(tmp_file, engine="xlsxwriter")
    data = source[~source["repeat"]].reset_index()
    # exception for filtered by member type return only repeatable question
    if data.shape[0]:
        write_sheet(data, writer, main_sheet_name, show_comment)
    # rendering repeatable question group
    repeat_rows = source[source["repeat"]]
    group_names = list(repeat_rows["question_group"].unique())
    for group_name in group_names:
        data = repeat_rows[
            repeat_rows["question_group"] == group_name
        ].reset_index()
        write_sheet(data, writer, group_name, show_comment)
    session.close()
    writer.save()
    return tmp_file
