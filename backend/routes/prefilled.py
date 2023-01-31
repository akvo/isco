from fastapi import Depends, Request, APIRouter
from fastapi.security import HTTPBearer
from fastapi.security import HTTPBasicCredentials as credentials
from typing import List
from sqlalchemy import and_, extract
from sqlalchemy.orm import Session
from db.connection import get_session
from middleware import verify_user
from models.data import Data, PrevProjectSubmissionResponse
from util.survey_config import PROJECT_SURVEY
from util.common import get_prev_year

security = HTTPBearer()
prefilled_route = APIRouter()


@prefilled_route.get(
    "/previous-project-submission",
    response_model=List[PrevProjectSubmissionResponse],
    name="prefilled:get_previous_project_submission",
    summary="get previous submission for project questionnaire",
    tags=["Prefilled"]
)
def get_previous_project_submission(
    req: Request,
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security)
):
    user = verify_user(
        session=session, authenticated=req.state.authenticated)
    prev_year = get_prev_year(year=True)
    # query for previous year submission
    data = session.query(Data).filter(and_(
        Data.submitted.isnot(None),
        extract('year', Data.submitted) == prev_year,
        Data.organisation == user.organisation,
        Data.form.in_(PROJECT_SURVEY)
    )).all()
    if not data:
        return []
    return [d.to_prev_project_submssion_list for d in data]
