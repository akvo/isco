import os
import json
from db.connection import Base, SessionLocal, engine
from db.truncator import truncate
from models.roadmap_question_group import RoadmapQuestionGroup
from models.roadmap_question import RoadmapQuestion


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

for qg in data.get('question_group'):
    group = RoadmapQuestionGroup(
        id=qg.get('id'),
        name=qg.get('name'),
        description=qg.get('description'),
        order=qg.get('order'),
        repeat=qg.get('repeatable'),
        repeat_text=qg.get('repeatText'),
        translations=qg.get('translations'))
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
        group.question.append(question)
    session.add(group)
    session.commit()
    session.flush()
    session.refresh(group)
    print(f"{group.order}. Seeding {group.name} done")

print("---------------------------")
print("Seeding Roadmap done")
