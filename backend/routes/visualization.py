from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    status,
    File,
    Form,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBasicCredentials as credentials
from fastapi.security import HTTPBearer
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.connection import get_session
from middleware import verify_user
from models.user import UserRole
from models.organisation import Organisation
from util.feedback_template import (
    generate_protected_feedback_template,
    parse_and_import_feedback_file,
)
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
    description: Optional[str] = None
    translations: Optional[List[dict]] = None
    series: List[IndicatorSeriesPoint]


class ChallengeDTO(BaseModel):
    id: str
    name: str
    indicators: List[IndicatorDTO]


class MemberMessageDTO(BaseModel):
    id: int
    year: int
    message: str
    translations: Optional[List[dict]] = None

    class Config:
        orm_mode = True


class FeedbackUploadResponse(BaseModel):
    status: str
    dry_run: bool
    total_rows: int
    imported: int
    errors: List[str]


class IndividualDashboardResponse(BaseModel):
    organisation: OrganisationSummary
    years: List[int]
    challenges: List[ChallengeDTO]
    peer_groups: Optional[List[PeerGroupSummary]] = None
    enable_peer_group_filter: bool = True
    member_message: Optional[MemberMessageDTO] = None
    member_messages: Optional[List[MemberMessageDTO]] = None


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
    peer_group_id: Optional[int] = Query(
        None,
        description="Optional peer group ID override",
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

    target_peer_group_id = (
        peer_group_id if isinstance(peer_group_id, int) else None
    )

    return service.get_individual_dashboard(
        session=session,
        organisation_id=target_org_id,
        years=years,
        peer_group_id=target_peer_group_id,
    )


@visualization_route.get(
    "/visualization/member-messages/template",
    summary="Download protected Excel template for member feedback",
    name="visualization:download_feedback_template",
    tags=["Visualization"],
)
def download_feedback_template(
    req: Request,
    year: Optional[int] = Query(None, description="Target survey year"),
    years: Optional[str] = Query(
        None, description="Comma-separated monitoring round years"
    ),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    auth = getattr(req.state, "authenticated", None)
    if isinstance(auth, HTTPException):
        raise auth
    user = verify_user(session=session, authenticated=auth)

    if user.role != UserRole.secretariat_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Secretariat Admins can download feedback templates",
        )

    organisations = (
        session.query(Organisation)
        .filter(Organisation.active.is_(True))
        .order_by(Organisation.name.asc())
        .all()
    )

    if years:
        target_years = [
            int(y.strip()) for y in years.split(",") if y.strip().isdigit()
        ]
    elif year is not None:
        target_years = [year]
    else:
        target_years = [2024, 2023, 2022]

    excel_stream = generate_protected_feedback_template(
        organisations=organisations,
        year=target_years,
    )

    if len(target_years) == 1:
        year_suffix = str(target_years[0])
    else:
        year_suffix = f"{min(target_years)}_{max(target_years)}"

    filename = f"ISCO_Member_Feedback_Template_{year_suffix}.xlsx"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        excel_stream,
        media_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
        headers=headers,
    )


@visualization_route.post(
    "/visualization/member-messages/upload",
    response_model=FeedbackUploadResponse,
    summary="Upload completed member feedback spreadsheet",
    name="visualization:upload_feedback",
    tags=["Visualization"],
)
async def upload_feedback_spreadsheet(
    req: Request,
    file: UploadFile = File(...),
    dry_run: bool = Form(False),
    session: Session = Depends(get_session),
    credentials: credentials = Depends(security),
):
    auth = getattr(req.state, "authenticated", None)
    if isinstance(auth, HTTPException):
        raise auth
    user = verify_user(session=session, authenticated=auth)

    if user.role != UserRole.secretariat_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Secretariat Admins can upload member feedback",
        )

    contents = await file.read()
    result = parse_and_import_feedback_file(
        file_contents=contents,
        filename=file.filename or "upload.xlsx",
        session=session,
        dry_run=dry_run,
    )
    return result
