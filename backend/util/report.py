import os
import pandas as pd
import re
import uuid
from typing import Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from models.question_group import QuestionGroup
from models.question import QuestionType
from models.cascade_list import CascadeList
from models.roadmap_question_group import RoadmapQuestionGroup
import jinja2
import util.storage as storage

webdomain = os.environ["WEBDOMAIN"]


def generate(data, detail, roadmap):
    template_loader = jinja2.FileSystemLoader(searchpath="./templates")
    template_env = jinja2.Environment(loader=template_loader)
    template_file = "roadmap.html" if roadmap else "report.html"
    template = template_env.get_template(template_file)
    output_text = template.render(
        webdomain=webdomain, data=data, detail=detail)
    filename = "{}-{}".format(data["form"]["id"], data["id"])
    html_path = f"./tmp/{filename}.html"
    organisation_folder = re.sub(
        '[^A-Za-z0-9_]+', '',
        data["organisation"]["name"].lower().replace(" ", "_"))
    folder = "downloads/{}_{}".format(data["organisation"]["id"],
                                      organisation_folder)
    html_file = open(html_path, 'w')
    html_file.write(output_text)
    filename = "{}-{}.html".format(filename, str(uuid.uuid4()))
    html_file.close()
    file = storage.upload(file=html_path,
                          folder=folder,
                          filename=filename)
    return file


def transform_data(answers: list, session: Session, questionGroupModel:
                   Optional[bool] = True):
    model = QuestionGroup if questionGroupModel else RoadmapQuestionGroup
    answers = pd.DataFrame(answers)
    group = answers["group"].drop_duplicates().to_list()
    group = session.query(model).filter(
        model.id.in_(list(group))).all()
    group = [{
        "id": g.id,
        "name": g.name,
        "order": g.order,
        "repeatable": g.repeat,
        "description": g.description
    } for g in group]
    answers["group_order"] = answers["group"].apply(
        lambda x: list(filter(lambda g: g["id"] == x, group))[0]["order"])
    answers["group_name"] = answers["group"].apply(
        lambda x: list(filter(lambda g: g["id"] == x, group))[0]["name"])
    answers = answers.to_dict("records")
    for g in group:
        group_answer = list(filter(lambda x: x["group"] == g["id"], answers))
        res = defaultdict(list)
        repeat = []
        for i in group_answer:
            res[i['repeat']].append(i)
        for r in res:
            answer = [{
                "question": a["name"],
                "value": a["value"],
                "value_type": a["value_type"],
                "tooltip": a["tooltip"],
                "comment": a["comment"] if questionGroupModel else None
            } for a in res[r]]
            repeat.append({"repeat": r, "answers": answer})
        g.update({"data": repeat})
    return sorted(group, key=lambda d: d['order'])


def get_cascade_value(data: dict, session: Session):
    answers = data['answer']
    for a in answers:
        if a['value'] and a['question_type'] == QuestionType.cascade:
            ids = []
            for v in a['value'].split(" - "):
                try:
                    ids.append(int(float(v)))
                except ValueError:
                    ids.append(v)
            cascades = session.query(CascadeList).filter(
                CascadeList.id.in_(ids)).all()
            if cascades:
                cascade_value = [c.name for c in cascades]
                a.update({"value": " - ".join(cascade_value)})
    data.update({"answer": answers})
    return data
