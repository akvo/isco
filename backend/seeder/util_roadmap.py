import os
import json
from models.roadmap_question_group import RoadmapQuestionGroup
from models.roadmap_question import RoadmapQuestion
from models.roadmap_option import RoadmapOption
from models.roadmap_template import RoadmapTemplate
from models.organisation import Organisation
from sqlalchemy import func

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def roadmap_form_seeder(session):
    source_file = "./source/roadmap.json"
    f = open(source_file)
    try:
        data = json.load(f)
    except FileNotFoundError:
        data = {}
    if "question_group" in data:
        for qg in data.get('question_group'):
            print(f"{qg.get('order')}. Seeding {qg.get('name')} ...")
            group = RoadmapQuestionGroup(
                id=qg.get('id'),
                name=qg.get('name'),
                description=qg.get('description'),
                order=qg.get('order'),
                repeat=qg.get('repeatable'),
                repeat_text=qg.get('repeatText'),
                translations=qg.get('translations'))
            if "question" not in qg:
                continue
            for q in qg.get('question'):
                tooltip = None
                if q.get('tooltip'):
                    tooltip = q.get('tooltip')
                    tooltip = tooltip.get('text')
                question = RoadmapQuestion(
                    id=q.get('id'),
                    name=q.get('name'),
                    question_group=qg.get('id'),
                    columns=q.get('columns'),
                    translations=q.get('translations'),
                    dependency=q.get('dependency'),
                    mandatory=q.get('required'),
                    datapoint_name=q.get('meta'),
                    variable_name=q.get('variableName'),
                    type=q.get('type'),
                    personal_data=q.get('personalData'),
                    rule=q.get('rule'),
                    tooltip=tooltip,
                    cascade=None,
                    tooltip_translations=q.get('tooltip_translations'),
                    repeating_objects=q.get('repeating_objects'),
                    order=q.get('order'))
                if "option" not in q:
                    group.question.append(question)
                    continue
                for opt in q.get('option'):
                    option = RoadmapOption(
                        id=opt.get('id'),
                        code=opt.get('code'),
                        name=opt.get('name'),
                        question=q.get('id'),
                        translations=opt.get('translations'),
                        order=opt.get('order'))
                    question.option.append(option)
                group.question.append(question)
            session.add(group)
            session.commit()
            session.flush()
            session.refresh(group)
            print(f"     - {group.name} seed done")

    print("---------------------------")
    print("Seeding Roadmap Form done")
    return True


def roadmap_template_seeder(session):
    source_file = "./source/roadmap_template.json"
    f = open(source_file)
    try:
        data = json.load(f)
    except FileNotFoundError:
        data = []
    for d in data:
        org_name = d.get('organisation_name')
        org_name = org_name.lower().strip() if org_name else None
        organisation = session.query(Organisation).filter(
            func.lower(Organisation.name) == org_name).first()
        if not organisation:
            print("ERROR -----------------------------------")
            print(f"404 - Organisation {org_name} not found!")
            print("-----------------------------------------")
            continue
        if not d.get('questions'):
            print("ERROR -----------------------------------")
            print(f"404 - Organisation {org_name} doesn't have questions!")
            print("-----------------------------------------")
            continue
        for q in d.get('questions'):
            template = RoadmapTemplate(
                id=None,
                organisation=organisation.id,
                question=q.get('id'),
                mandatory=q.get('mandatory'))
            session.add(template)
            session.commit()
            session.flush()
            session.refresh(template)
        print(f"Seeding Roadmap Template for Organisation {org_name} done")
    print("---------------------------")
    print("Seeding Roadmap Template done")
    return True
