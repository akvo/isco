from typing import Optional
from fastapi import HTTPException
from sqlalchemy import and_, null
from sqlalchemy.sql.expression import false
from sqlalchemy.orm import Session
from models.views.summary import Summary
from models.organisation_isco import OrganisationIsco
from models.data import Data
from models.question import Question, QuestionType
from models.cascade_list import CascadeList
from middleware import organisations_in_same_isco
import pandas as pd

main_sheet_name = "Index"


def write_sheet(df, writer, sheet_name):
    cols = [
        "data_id", "question_group", "question", "members",
        "submitted"
    ]
    if sheet_name != main_sheet_name:
        cols = [
            "data_id", "repeat_index", "question_group", "question",
            "members", "submitted"
        ]
        df["repeat_index"] = df["repeat_index"] + 1
    df = df[cols + ["answer"]]
    df.rename(columns={"members": "member_type"})
    df = df.groupby(cols).first()
    df = df.unstack(["question_group", "question"])
    df.columns = df.columns.rename("", level=1)
    df.columns = df.columns.rename("", level=2)
    if len(sheet_name) > 20:
        sheet_name = sheet_name[:15] + "..."
    df = df["answer"]
    df.to_excel(writer, sheet_name=sheet_name)


def generate_summary(session: Session,
                     filename: str,
                     form_id: int,
                     user_org: int,
                     member_type: Optional[int] = None):
    tmp_file = f"./tmp/{filename}.xlsx"
    # find user organisation isco
    org_isco = session.query(OrganisationIsco).filter(
        OrganisationIsco.organisation == user_org).all()
    isco_ids = [i.isco_type for i in org_isco]
    # find organisation in same isco
    org_in_same_isco = organisations_in_same_isco(
        session=session, organisation=user_org)
    # find data id by organisation in same isco
    data = session.query(Data).filter(and_(
        Data.form == form_id,
        Data.organisation.in_(org_in_same_isco),
        Data.submitted != null())).all()
    data_ids = [d.id for d in data]
    # filter question with personal data flag
    questions = session.query(Question).filter(and_(
        Question.form == form_id,
        Question.personal_data == false()))
    qids_no_personal_data = [q.id for q in questions.all()]
    # query summary view and filter by data ids and qids_no_personal_data
    summary = session.query(Summary).filter(and_(
        Summary.fid == form_id,
        Summary.data_id.in_(data_ids),
        Summary.qid.in_(qids_no_personal_data)))
    # question - filter by user isco
    if isco_ids:
        isco_ids += [1]  # add all isco type
        summary = summary.filter(Summary.isco_type.contained_by(isco_ids))
    # question - filter by member type dropdown
    if member_type:
        members = [1]  # add all member type
        members += [member_type]
        summary = summary.filter(
            Summary.member_type.contained_by(members)).all()
    else:
        summary = summary.all()
    if not summary:
        raise HTTPException(status_code=404, detail="No Data Available")
    summary = [s.serialize for s in summary]
    # transform cascade answer value
    questions = questions.filter(
        Question.type == QuestionType.cascade.value).all()
    q_cascades = {}
    for q in questions:
        temp = {}
        cascade_list = session.query(CascadeList).filter(
            CascadeList.cascade == q.cascade).all()
        for cl in cascade_list:
            temp.update({cl.id: cl.name})
        q_cascades.update({q.id: temp})
    for s in summary:
        if s['qid'] in q_cascades and q_cascades[s['qid']] \
           and s['answer'] is not None:
            cascade_list_ids = [int(x) for x in s['answer'].split("|")]
            cascade_answer = []
            temp = q_cascades[s['qid']]
            for cl in cascade_list_ids:
                if cl in temp and temp[cl]:
                    cascade_answer.append(temp[cl])
            s['answer'] = '|'.join(cascade_answer) \
                if cascade_answer else s['answer']
    # start create spreadsheet
    source = pd.DataFrame(summary)
    writer = pd.ExcelWriter(tmp_file, engine='xlsxwriter')
    data = source[~source["repeat"]].reset_index()
    write_sheet(data, writer, main_sheet_name)
    repeat_rows = source[source["repeat"]]
    group_names = list(repeat_rows["question_group"].unique())
    for group_name in group_names:
        data = repeat_rows[repeat_rows["question_group"] ==
                           group_name].reset_index()
        write_sheet(data, writer, group_name)
    session.close()
    writer.save()
    return tmp_file