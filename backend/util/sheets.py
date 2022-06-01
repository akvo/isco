from typing import Optional, List
from fastapi import HTTPException
# from sqlalchemy import and_
from sqlalchemy.orm import Session
from models.views.summary import Summary
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
                     isco_type: List[int],
                     member_type: Optional[int] = None):
    tmp_file = f"./tmp/{filename}.xlsx"
    summary = session.query(Summary).filter(Summary.fid == form_id)
    # filter by user isco
    if isco_type:
        isco_type += [1]  # add all isco type
        summary = summary.filter(Summary.isco_type.contained_by(isco_type))
    # filter by member type dropdown
    if member_type:
        summary = summary.filter(Summary.member_type.any(member_type)).all()
    else:
        summary = summary.all()
    if not summary:
        raise HTTPException(status_code=404, detail="No Data Available")
    summary = [s.serialize for s in summary]
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
