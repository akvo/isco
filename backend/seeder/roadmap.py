import os
import json
from db.connection import Base, SessionLocal, engine
from db.truncator import truncate
from models.roadmap_question_group import RoadmapQuestionGroup
from models.roadmap_question import RoadmapQuestion
from models.roadmap_option import RoadmapOption


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Base.metadata.create_all(bind=engine)
session = SessionLocal()

source_file = "./source/roadmap.json"

# truncate
for table in ["roadmap_question_group", "roadmap_question", "roadmap_option"]:
    action = truncate(session=session, table=table)
    print(action)
print("---------------------------")

f = open(source_file)
data = json.load(f)
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
print("Seeding Roadmap done")
