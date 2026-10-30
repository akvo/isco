from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.security import HTTPBasicCredentials as credentials
from fastapi.security import HTTPBearer
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.connection import get_session
from middleware import verify_user
from models.user import UserRole
from services.visualization_service import (
    VisualizationService,
    get_visualization_service,
)

security = HTTPBearer()
visualization_route = APIRouter()


class PeerGroupSummary(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        orm_mode = True


class OrganisationSummary(BaseModel):
    id: int
    name: str
    peer_group: PeerGroupSummary

    class Config:
        orm_mode = True


class IndicatorSeriesPoint(BaseModel):
    year: int
    member: Optional[float] = None
    isco_avg: Optional[float] = None
    gisco_avg: Optional[float] = None


class IndicatorDTO(BaseModel):
    id: str
    name: str
    country: str
    unit: str
    chart_type: str
    higher_is_better: bool
    series: List[IndicatorSeriesPoint]


class ChallengeDTO(BaseModel):
    id: str
    name: str
    indicators: List[IndicatorDTO]


class IndividualDashboardResponse(BaseModel):
    organisation: OrganisationSummary
    years: List[int]
    challenges: List[ChallengeDTO]


@visualization_route.get(
    "/visualization/individual-dashboard",
    response_model=IndividualDashboardResponse,
    summary="Get individual member dashboard with peer group benchmarks",
    name="visualization:individual_dashboard",
    tags=["Visualization"],
)
def get_individual_dashboard(
    req: Request,
    organisation_id: Optional[int] = Query(
        None,
        description="Target organisation id (secretariat_admin only)",
    ),
    years: Optional[List[int]] = Query(
        None,
        description="Optional list of monitoring round years",
    ),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
    service: VisualizationService = Depends(get_visualization_service),
):
    auth = getattr(req.state, "authenticated", None)
    if isinstance(auth, HTTPException):
        raise auth
    user = verify_user(session=session, authenticated=auth)

    # Multi-tenant RBAC resolution
    if user.role == UserRole.secretariat_admin:
        target_org_id = (
            organisation_id
            if organisation_id is not None
            else user.organisation
        )
    else:
        # Regular members (member_user, member_admin)
        if (
            organisation_id is not None
            and organisation_id != user.organisation
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized to view another "
                    "organization's dashboard"
                ),
            )
        target_org_id = user.organisation

    if not target_org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with an organisation",
        )

    return service.get_individual_dashboard(
        session=session,
        organisation_id=target_org_id,
        years=years,
    )
