import os
import json
from models.roadmap_question_group import RoadmapQuestionGroup
from models.roadmap_question import RoadmapQuestion, RoadmapQuestionType
from models.roadmap_option import RoadmapOption

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
            find_group = session.query(
                RoadmapQuestionGroup).filter(
                    RoadmapQuestionGroup.id == qg.get('id')).first()
            # generating group
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
                find_question = session.query(
                    RoadmapQuestion).filter(
                        RoadmapQuestion.id == q.get('id')).first()
                tooltip = None
                if q.get('tooltip'):
                    tooltip = q.get('tooltip')
                    tooltip = tooltip.get('text')
                # generating question
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
                if question.type == RoadmapQuestionType.option.value \
                   and "option" in q:
                    for opt in q.get('option'):
                        find_option = session.query(
                            RoadmapOption).filter(
                                RoadmapOption.id == opt.get('id')).first()
                        # generating option
                        option = RoadmapOption(
                            id=opt.get('id'),
                            code=opt.get('code'),
                            name=opt.get('name'),
                            question=q.get('id'),
                            translations=opt.get('translations'),
                            order=opt.get('order'))
                        if not find_option and find_question and \
                           find_question.type != RoadmapQuestionType.option:
                            session.add(option)
                            continue
                        if find_option:
                            find_option.code = option.code
                            find_option.name = option.name
                            find_option.question = option.question,
                            find_option.translations = option.translations
                            find_option.order = option.order
                        question.option.append(option)
                # handle question type from option to another type
                if find_question and find_question.type == \
                    RoadmapQuestionType.option and question.type != \
                        RoadmapQuestionType.option.value:
                    # delete old option
                    session.query(RoadmapOption).filter(
                        RoadmapOption.question == question.id).delete()
                if find_question:
                    find_question.name = question.name
                    find_question.question_group = question.question_group
                    find_question.columns = question.columns
                    find_question.translations = question.translations
                    find_question.dependency = question.dependency
                    find_question.mandatory = question.mandatory
                    find_question.datapoint_name = question.datapoint_name
                    find_question.variable_name = question.variable_name
                    find_question.type = question.type
                    find_question.personal_data = \
                        question.personal_data or False
                    find_question.rule = question.rule
                    find_question.tooltip = tooltip
                    find_question.tooltip_translations = \
                        question.tooltip_translations
                    find_question.repeating_objects = \
                        question.repeating_objects
                    find_question.order = question.order
                group.question.append(question)
            if not find_group:
                session.add(group)
                session.commit()
                session.flush()
                session.refresh(group)
            if find_group:
                find_group.name = group.name
                find_group.description = group.description
                find_group.order = group.order
                find_group.repeat = group.repeat
                find_group.repeat_text = group.repeat_text
                find_group.translations = group.translations
                session.commit()
                session.flush()
            print(f"     - {group.name} seed done")

    print("---------------------------")
    print("Seeding Roadmap Form done")
    return True
