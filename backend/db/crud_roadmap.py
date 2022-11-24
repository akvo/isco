from fastapi import HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from models.roadmap_question_group import RoadmapQuestionGroupDict
from models.roadmap_question_group import RoadmapQuestionGroup
from models.roadmap_template import RoadmapTemplateDict
from models.roadmap_template import RoadmapTemplate


def get_roadmap_question_group(
    session: Session
) -> List[RoadmapQuestionGroupDict]:
    qg = session.query(RoadmapQuestionGroup).all()
    if not len(qg):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmapp form not found")
    return qg


def get_roadmap_template_by_organisation_id(
    session: Session, organisation_id: int
) -> List[RoadmapTemplateDict]:
    return session.query(RoadmapTemplate).filter(
        RoadmapTemplate.organisation == organisation_id).all()
