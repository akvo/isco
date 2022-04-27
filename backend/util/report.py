import pandas as pd
from collections import defaultdict
from sqlalchemy.orm import Session
from models.question_group import QuestionGroup
import jinja2


def generate(form, data):
    template_loader = jinja2.FileSystemLoader(searchpath="./templates")
    template_env = jinja2.Environment(loader=template_loader)
    template_file = "report.html"
    template = template_env.get_template(template_file)
    output_text = template.render(form=form, data=data)
    html_path = f'./tmp/data-{form.id}.html'
    html_file = open(html_path, 'w')
    html_file.write(output_text)
    html_file.close()
    return html_path


def transform_data(answers: list, session: Session):
    answers = pd.DataFrame(answers)
    group = answers["group"].drop_duplicates().to_list()
    group = session.query(QuestionGroup).filter(
        QuestionGroup.id.in_(list(group))).all()
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
                "comment": a["comment"]
            } for a in res[r]]
            repeat.append({"repeat": r, "answers": answer})
        g.update({"data": repeat})
    return sorted(group, key=lambda d: d['order'])
