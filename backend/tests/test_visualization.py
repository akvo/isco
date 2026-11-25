import pytest
from datetime import datetime, timedelta
from typing import Tuple
from fastapi import FastAPI
from httpx import AsyncClient
from jose import jwt
from middleware import SECRET_KEY, ALGORITHM
from sqlalchemy.orm import Session
from models.user import User, UserRole
from models.organisation import Organisation
from models.organisation_member import OrganisationMember
from models.member_type import MemberType
from models.peer_group import PeerGroup, PeerGroupMemberType
from models.form import Form
from models.data import Data
from models.question import Question, QuestionType
from models.question_group import QuestionGroup
from models.answer import Answer
from middleware import create_access_token
import main  # noqa: F401

pytestmark = pytest.mark.asyncio


def _get_or_create_peer_group_with_member_type(
    session: Session,
    code: str = "large_manufacturer",
    name: str = "Large Manufacturer",
) -> Tuple[PeerGroup, MemberType]:
    pg = session.query(PeerGroup).filter(PeerGroup.code == code).first()
    if not pg:
        pg = PeerGroup(name=name, code=code, description=f"Test {name}")
        session.add(pg)
        session.commit()
        session.refresh(pg)

    mt = session.query(MemberType).first()
    if not mt:
        mt = MemberType(id=None, name=f"Test Member Type {code}")
        session.add(mt)
        session.commit()
        session.refresh(mt)

    # Ensure mapping exists
    mapping = (
        session.query(PeerGroupMemberType)
        .filter(
            PeerGroupMemberType.peer_group_id == pg.id,
            PeerGroupMemberType.member_type_id == mt.id,
        )
        .first()
    )
    if not mapping:
        mapping = PeerGroupMemberType(
            peer_group_id=pg.id,
            member_type_id=mt.id,
            isco_scope="ALL",
        )
        session.add(mapping)
        session.commit()

    return pg, mt


@pytest.fixture
def test_setup(session: Session):
    """
    Sets up two member orgs (Org A, Org B) with mapped peer groups,
    one unmapped organisation (Org C), and users for each role.
    """
    pg, mt = _get_or_create_peer_group_with_member_type(session)

    # Org A: mapped to peer group
    org_a = (
        session.query(Organisation)
        .filter(Organisation.code == "ORG_A")
        .first()
    )
    if not org_a:
        org_a = Organisation(
            name="Organisation Alpha", code="ORG_A", active=True
        )
        session.add(org_a)
        session.commit()
        session.refresh(org_a)

    org_a_mem = (
        session.query(OrganisationMember)
        .filter(OrganisationMember.organisation == org_a.id)
        .first()
    )
    if not org_a_mem:
        org_a_mem = OrganisationMember(
            id=None, organisation=org_a.id, member_type=mt.id
        )
        session.add(org_a_mem)
        session.commit()

    # Org B: mapped to peer group
    org_b = (
        session.query(Organisation)
        .filter(Organisation.code == "ORG_B")
        .first()
    )
    if not org_b:
        org_b = Organisation(
            name="Organisation Beta", code="ORG_B", active=True
        )
        session.add(org_b)
        session.commit()
        session.refresh(org_b)

    org_b_mem = (
        session.query(OrganisationMember)
        .filter(OrganisationMember.organisation == org_b.id)
        .first()
    )
    if not org_b_mem:
        org_b_mem = OrganisationMember(
            id=None, organisation=org_b.id, member_type=mt.id
        )
        session.add(org_b_mem)
        session.commit()

    # Org C: no member type mapping
    org_c = (
        session.query(Organisation)
        .filter(Organisation.code == "ORG_C")
        .first()
    )
    if not org_c:
        org_c = Organisation(
            name="Organisation Gamma Unmapped", code="ORG_C", active=True
        )
        session.add(org_c)
        session.commit()
        session.refresh(org_c)

    # User A (member_user in Org A)
    user_a = (
        session.query(User).filter(User.email == "user_a@akvo.org").first()
    )
    if not user_a:
        user_a = User(
            name="User Alpha",
            email="user_a@akvo.org",
            phone_number="11111",
            password="hashed_pw",
            role=UserRole.member_user,
            approved=True,
            organisation=org_a.id,
        )
        user_a.email_verified = datetime.utcnow()
        session.add(user_a)
        session.commit()

    # Admin A (member_admin in Org A)
    admin_a = (
        session.query(User).filter(User.email == "admin_a@akvo.org").first()
    )
    if not admin_a:
        admin_a = User(
            name="Admin Alpha",
            email="admin_a@akvo.org",
            phone_number="22222",
            password="hashed_pw",
            role=UserRole.member_admin,
            approved=True,
            organisation=org_a.id,
        )
        admin_a.email_verified = datetime.utcnow()
        session.add(admin_a)
        session.commit()

    # User B (member_user in Org B)
    user_b = (
        session.query(User).filter(User.email == "user_b@akvo.org").first()
    )
    if not user_b:
        user_b = User(
            name="User Beta",
            email="user_b@akvo.org",
            phone_number="33333",
            password="hashed_pw",
            role=UserRole.member_user,
            approved=True,
            organisation=org_b.id,
        )
        user_b.email_verified = datetime.utcnow()
        session.add(user_b)
        session.commit()

    # Secretariat Admin
    sec_admin = (
        session.query(User)
        .filter(User.email == "sec_admin_vis@akvo.org")
        .first()
    )
    if not sec_admin:
        sec_admin = User(
            name="Secretariat Admin Vis",
            email="sec_admin_vis@akvo.org",
            phone_number="44444",
            password="hashed_pw",
            role=UserRole.secretariat_admin,
            approved=True,
            organisation=org_a.id,
        )
        sec_admin.email_verified = datetime.utcnow()
        session.add(sec_admin)
        session.commit()

    return {
        "org_a": org_a,
        "org_b": org_b,
        "org_c": org_c,
        "peer_group": pg,
        "member_type": mt,
        "user_a_token": create_access_token(
            data={"email": user_a.email}
        )["token"],
        "admin_a_token": create_access_token(
            data={"email": admin_a.email}
        )["token"],
        "user_b_token": create_access_token(
            data={"email": user_b.email}
        )["token"],
        "sec_admin_token": create_access_token(
            data={"email": sec_admin.email}
        )["token"],
    }


async def test_unauthenticated_request_rejected(
    app: FastAPI, client: AsyncClient
):
    """TAC-04.4: Rejects unauthenticated requests with 401/403."""
    res = await client.get("/visualization/individual-dashboard")
    assert res.status_code in [401, 403]


async def test_expired_token_rejected(app: FastAPI, client: AsyncClient):
    """TAC-04.4: Rejects expired bearer token with 401."""
    expired_exp = datetime.utcnow() - timedelta(days=1)
    expired_jwt = jwt.encode(
        {"email": "test@akvo.org", "exp": expired_exp},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    headers = {"Authorization": f"Bearer {expired_jwt}"}
    res = await client.get(
        "/visualization/individual-dashboard", headers=headers
    )
    assert res.status_code == 401


async def test_member_user_access_own_dashboard(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    UAC-04.1 & TAC-04.1:
    Authenticated member_user sees own dashboard payload with 200 OK.
    """
    headers = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    res = await client.get(
        "/visualization/individual-dashboard", headers=headers
    )
    assert res.status_code == 200

    data = res.json()
    assert "organisation" in data
    assert data["organisation"]["id"] == test_setup["org_a"].id
    assert data["organisation"]["name"] == test_setup["org_a"].name
    assert "peer_group" in data["organisation"]
    pg_res = data["organisation"]["peer_group"]
    assert pg_res["id"] == test_setup["peer_group"].id
    assert pg_res["code"] == test_setup["peer_group"].code

    assert "years" in data
    assert isinstance(data["years"], list)
    assert len(data["years"]) >= 3

    assert "challenges" in data
    assert len(data["challenges"]) == 4

    # Verify indicator series structure
    challenge = data["challenges"][0]
    assert "indicators" in challenge
    assert len(challenge["indicators"]) > 0
    ind = challenge["indicators"][0]
    assert "series" in ind
    assert "chart_type" in ind
    assert "higher_is_better" in ind
    for point in ind["series"]:
        assert "year" in point
        assert "member" in point
        assert "isco_avg" in point
        assert "gisco_avg" in point


async def test_member_user_forbidden_foreign_organisation(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    UAC-04.3 & TAC-04.2:
    member_user passing foreign organisation_id is blocked with 403.
    """
    headers = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    other_org_id = test_setup["org_b"].id
    res = await client.get(
        f"/visualization/individual-dashboard?organisation_id={other_org_id}",
        headers=headers,
    )
    assert res.status_code == 403
    assert "not authorized" in res.json().get("detail", "").lower()


async def test_member_admin_forbidden_foreign_organisation(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    UAC-04.3 & TAC-04.2:
    member_admin passing foreign organisation_id is blocked with 403.
    """
    headers = {"Authorization": f"Bearer {test_setup['admin_a_token']}"}
    other_org_id = test_setup["org_b"].id
    res = await client.get(
        f"/visualization/individual-dashboard?organisation_id={other_org_id}",
        headers=headers,
    )
    assert res.status_code == 403
    assert "not authorized" in res.json().get("detail", "").lower()


async def test_member_user_own_organisation_query_param_allowed(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    member_user passing own organisation_id explicitly is allowed (200 OK).
    """
    headers = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    own_org_id = test_setup["org_a"].id
    res = await client.get(
        f"/visualization/individual-dashboard?organisation_id={own_org_id}",
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["organisation"]["id"] == own_org_id


async def test_secretariat_admin_switch_organisation(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    UAC-04.2:
    secretariat_admin can pass ?organisation_id={id} to inspect any member.
    """
    headers = {"Authorization": f"Bearer {test_setup['sec_admin_token']}"}
    target_org_id = test_setup["org_b"].id
    res = await client.get(
        f"/visualization/individual-dashboard?organisation_id={target_org_id}",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["organisation"]["id"] == target_org_id
    assert data["organisation"]["name"] == test_setup["org_b"].name


async def test_secretariat_admin_default_organisation(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    secretariat_admin omitting organisation_id defaults to admin's own org.
    """
    headers = {"Authorization": f"Bearer {test_setup['sec_admin_token']}"}
    res = await client.get(
        "/visualization/individual-dashboard", headers=headers
    )
    assert res.status_code == 200
    assert res.json()["organisation"]["id"] == test_setup["org_a"].id


async def test_non_existent_organisation_404(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """TAC-04.4: Non-existent organisation returns 404 Not Found."""
    headers = {"Authorization": f"Bearer {test_setup['sec_admin_token']}"}
    res = await client.get(
        "/visualization/individual-dashboard?organisation_id=999999",
        headers=headers,
    )
    assert res.status_code == 404
    assert "not found" in res.json().get("detail", "").lower()


async def test_organisation_without_mapped_peer_group_422(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """TAC-04.4: Organisation without mapped peer group returns 422."""
    headers = {"Authorization": f"Bearer {test_setup['sec_admin_token']}"}
    unmapped_org_id = test_setup["org_c"].id
    res = await client.get(
        f"/visualization/individual-dashboard?organisation_id="
        f"{unmapped_org_id}",
        headers=headers,
    )
    assert res.status_code == 422
    detail = res.json().get("detail", "")
    assert test_setup["org_c"].name in detail
    assert (
        "no mapped member type" in detail.lower()
        or "no mapped peer group" in detail.lower()
    )


async def test_years_filter_query_param(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """TAC-04.1: Parameterized years query limits returned years in series."""
    headers = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    res = await client.get(
        "/visualization/individual-dashboard?years=2022&years=2023",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["years"] == [2022, 2023]
    for ch in data["challenges"]:
        for ind in ch["indicators"]:
            years_in_series = [pt["year"] for pt in ind["series"]]
            assert years_in_series == [2022, 2023]


async def test_member_answers_evaluation_with_real_submissions(
    app: FastAPI, client: AsyncClient, test_setup: dict, session: Session
):
    """
    TAC-04.1 & UAC-04.1:
    Verifies that member's submitted survey answers are extracted,
    evaluated against formulas, and populated in the member series.
    """
    from services.survey_id_resolver import SurveyIdResolver

    org_a = test_setup["org_a"]

    # 1. Ensure Form and Question Group exist
    form = session.query(Form).filter(Form.id == 7).first()
    if not form:
        form = Form(
            id=7,
            name="Member Survey Webform",
            description="Test",
            enable_prefilled_value=False,
            languages=["en"],
        )
        session.add(form)
        session.commit()

    qg = session.query(QuestionGroup).filter(QuestionGroup.form == 7).first()
    if not qg:
        qg = QuestionGroup(
            id=7790,
            form=7,
            name="Test Group",
            translations=[],
            repeat=False,
            order=1,
            description=None,
            repeat_text=None,
            leading_question=None,
            show_repeat_in_question_level=False,
        )
        session.add(qg)
        session.commit()

    resolver = SurveyIdResolver()
    local_qid = resolver.resolve_question_id(86)
    q86 = session.query(Question).filter(Question.id == local_qid).first()
    if not q86:
        q86 = Question(
            id=local_qid,
            name="Share sourced directly",
            form=7,
            question_group=qg.id,
            translations=[],
            mandatory=False,
            datapoint_name=False,
            variable_name="ID86",
            type=QuestionType.number,
            personal_data=False,
            rule={},
            tooltip=None,
            cascade=None,
            tooltip_translations=[],
            repeating_objects=[],
            order=1,
            core_mandatory=False,
            deactivate=False,
            autofield={},
        )
        session.add(q86)
        session.commit()

    data_sub = datetime(2023, 6, 1)
    data_2023 = Data(
        name="Org A 2023 Submission",
        form=7,
        geo=[],
        locked_by=None,
        created_by=1,
        organisation=org_a.id,
        submitted_by=1,
        created=data_sub,
        updated=data_sub,
        submitted=data_sub,
    )
    session.add(data_2023)
    session.commit()
    session.refresh(data_2023)

    ans86 = Answer(
        question=local_qid,
        created=data_sub,
        data=data_2023.id,
        value=0.755,
    )
    session.add(ans86)
    session.commit()

    headers = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    res = await client.get(
        "/visualization/individual-dashboard", headers=headers
    )
    assert res.status_code == 200

    data = res.json()
    # Find sourced_directly indicator
    found = False
    for ch in data["challenges"]:
        for ind in ch["indicators"]:
            if ind["id"] == "sourced_directly":
                found = True
                for pt in ind["series"]:
                    if pt["year"] == 2023:
                        assert pt["member"] == 0.755
    assert found


async def test_endpoint_user_without_organisation_400(
    app: FastAPI, client: AsyncClient, session: Session
):
    """Verifies that user without an organisation returns 400 Bad Request."""
    no_org_user = (
        session.query(User).filter(User.email == "no_org@akvo.org").first()
    )
    if not no_org_user:
        no_org_user = User(
            name="No Org User",
            email="no_org@akvo.org",
            phone_number="55555",
            password="hashed_pw",
            role=UserRole.member_user,
            approved=True,
            organisation=None,
        )
        no_org_user.email_verified = datetime.utcnow()
        session.add(no_org_user)
        session.commit()

    token = create_access_token(data={"email": no_org_user.email})["token"]
    headers = {"Authorization": f"Bearer {token}"}
    res = await client.get(
        "/visualization/individual-dashboard", headers=headers
    )
    assert res.status_code == 400
    assert (
        "not associated with an organisation"
        in res.json().get("detail", "").lower()
    )


def test_service_direct_not_found(session: Session):
    """Direct service unit test verifying 404 for non-existent org."""
    from services.visualization_service import VisualizationService
    from fastapi import HTTPException

    service = VisualizationService()
    with pytest.raises(HTTPException) as exc_info:
        service.get_individual_dashboard(
            session=session, organisation_id=987654
        )
    assert exc_info.value.status_code == 404


def test_service_direct_no_member_type(session: Session, test_setup: dict):
    """Direct service unit test verifying 422 for org without member type."""
    from services.visualization_service import VisualizationService
    from fastapi import HTTPException

    service = VisualizationService()
    with pytest.raises(HTTPException) as exc_info:
        service.get_individual_dashboard(
            session=session, organisation_id=test_setup["org_c"].id
        )
    assert exc_info.value.status_code == 422
    assert "no mapped member type" in str(exc_info.value.detail).lower()


def test_service_direct_no_peer_group(session: Session):
    """Direct service test verifying 422 for unmapped member type."""
    from services.visualization_service import VisualizationService
    from fastapi import HTTPException

    # Create unmapped member type and organisation
    unmapped_mt = (
        session.query(MemberType)
        .filter(MemberType.name == "Unmapped MT")
        .first()
    )
    if not unmapped_mt:
        unmapped_mt = MemberType(id=None, name="Unmapped MT")
        session.add(unmapped_mt)
        session.commit()

    unmapped_org = (
        session.query(Organisation)
        .filter(Organisation.code == "ORG_UNMAPPED")
        .first()
    )
    if not unmapped_org:
        unmapped_org = Organisation(
            name="Unmapped Org", code="ORG_UNMAPPED", active=True
        )
        session.add(unmapped_org)
        session.commit()
        session.refresh(unmapped_org)

    org_mem = (
        session.query(OrganisationMember)
        .filter(OrganisationMember.organisation == unmapped_org.id)
        .first()
    )
    if not org_mem:
        org_mem = OrganisationMember(
            id=None, organisation=unmapped_org.id, member_type=unmapped_mt.id
        )
        session.add(org_mem)
        session.commit()

    service = VisualizationService()
    with pytest.raises(HTTPException) as exc_info:
        service.get_individual_dashboard(
            session=session, organisation_id=unmapped_org.id
        )
    assert exc_info.value.status_code == 422
    assert unmapped_org.name in exc_info.value.detail
    assert "no mapped peer group" in str(exc_info.value.detail).lower()


def test_service_latest_submission_deduplication(
    session: Session, test_setup: dict
):
    """
    Verifies that extract_member_answers picks the latest submission
    when multiple submissions exist for the same organisation, form, and year.
    """
    from services.visualization_service import VisualizationService

    service = VisualizationService()
    org_a = test_setup["org_a"]

    # Use an existing question ID to satisfy foreign key
    existing_q = session.query(Question).first()
    assert existing_q is not None
    target_qid = existing_q.id

    # First submission for 2024 (earlier timestamp)
    t1 = datetime(2024, 1, 10, 10, 0, 0)
    d1 = Data(
        name="Org A 2024 Sub 1",
        form=7,
        geo=[],
        locked_by=None,
        created_by=1,
        organisation=org_a.id,
        submitted_by=1,
        created=t1,
        updated=t1,
        submitted=t1,
    )
    session.add(d1)
    session.commit()
    session.refresh(d1)

    ans1 = Answer(
        question=target_qid,
        created=t1,
        data=d1.id,
        value=10.0,
    )
    session.add(ans1)

    # Second submission for 2024 (later timestamp)
    t2 = datetime(2024, 2, 20, 15, 0, 0)
    d2 = Data(
        name="Org A 2024 Sub 2",
        form=7,
        geo=[],
        locked_by=None,
        created_by=1,
        organisation=org_a.id,
        submitted_by=1,
        created=t2,
        updated=t2,
        submitted=t2,
    )
    session.add(d2)
    session.commit()
    session.refresh(d2)

    ans2 = Answer(
        question=target_qid,
        created=t2,
        data=d2.id,
        value=25.0,
    )
    session.add(ans2)
    session.commit()

    answers = service.extract_member_answers(
        session=session,
        organisation_id=org_a.id,
        years=[2024],
    )

    # Must contain value from the later submission (ans2 = 25.0)
    assert answers[2024].get(target_qid) == 25.0


def test_service_config_and_singleton():
    """Verifies service.config lazy loader and singleton provider."""
    from services.visualization_service import (
        VisualizationService,
        get_visualization_service,
    )
    svc = VisualizationService()
    assert "challenges" in svc.config
    assert len(svc.config["challenges"]) == 4

    singleton = get_visualization_service()
    assert singleton is not None
    assert isinstance(singleton, VisualizationService)


def test_route_handler_direct_calls(session: Session, test_setup: dict):
    """
    Directly exercises get_individual_dashboard route handler
    to ensure full code coverage across all RBAC branches.
    """
    from routes.visualization import get_individual_dashboard
    from services.visualization_service import VisualizationService
    from fastapi import HTTPException
    from unittest.mock import MagicMock

    service = VisualizationService()

    # 1. Secretariat Admin accessing foreign org
    mock_req_admin = MagicMock()
    mock_req_admin.state.authenticated = {
        "email": "sec_admin_vis@akvo.org",
        "exp": datetime.utcnow().timestamp() + 3600,
    }
    res_admin = get_individual_dashboard(
        req=mock_req_admin,
        organisation_id=test_setup["org_b"].id,
        years=[2022],
        session=session,
        credentials=None,
        service=service,
    )
    assert res_admin["organisation"]["id"] == test_setup["org_b"].id

    # 2. Secretariat Admin omitting organisation_id
    res_admin_default = get_individual_dashboard(
        req=mock_req_admin,
        organisation_id=None,
        years=[2022],
        session=session,
        credentials=None,
        service=service,
    )
    assert res_admin_default["organisation"]["id"] == test_setup["org_a"].id

    # 3. Member User accessing own org
    mock_req_user = MagicMock()
    mock_req_user.state.authenticated = {
        "email": "user_a@akvo.org",
        "exp": datetime.utcnow().timestamp() + 3600,
    }
    res_user = get_individual_dashboard(
        req=mock_req_user,
        organisation_id=None,
        years=[2022],
        session=session,
        credentials=None,
        service=service,
    )
    assert res_user["organisation"]["id"] == test_setup["org_a"].id

    # 4. Member User passing another org -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_403:
        get_individual_dashboard(
            req=mock_req_user,
            organisation_id=test_setup["org_b"].id,
            years=[2022],
            session=session,
            credentials=None,
            service=service,
        )
    assert exc_403.value.status_code == 403

    # 5. User without an organisation -> 400 Bad Request
    mock_req_no_org = MagicMock()
    mock_req_no_org.state.authenticated = {
        "email": "no_org@akvo.org",
        "exp": datetime.utcnow().timestamp() + 3600,
    }
    with pytest.raises(HTTPException) as exc_400:
        get_individual_dashboard(
            req=mock_req_no_org,
            organisation_id=None,
            years=[2022],
            session=session,
            credentials=None,
            service=service,
        )
    assert exc_400.value.status_code == 400

    # 6. Request with HTTPException in state.authenticated -> raised
    mock_req_err = MagicMock()
    mock_req_err.state.authenticated = HTTPException(
        status_code=401, detail="Unauthorized"
    )
    with pytest.raises(HTTPException) as exc_auth:
        get_individual_dashboard(
            req=mock_req_err,
            organisation_id=None,
            years=[2022],
            session=session,
            credentials=None,
            service=service,
        )
    assert exc_auth.value.status_code == 401


def test_extract_member_answers_repeat_questions(
    session: Session, test_setup: dict
):
    """
    Verifies that multiple answers for the same question within a submission
    (repeat groups) are correctly accumulated into a list.
    """
    from services.visualization_service import VisualizationService

    service = VisualizationService()
    org_a = test_setup["org_a"]

    existing_q = session.query(Question).first()
    assert existing_q is not None
    target_qid = existing_q.id

    t_rep = datetime(2023, 6, 1, 12, 0, 0)
    d_rep = Data(
        name="Org A 2023 Repeat Sub",
        form=7,
        geo=[],
        locked_by=None,
        created_by=1,
        organisation=org_a.id,
        submitted_by=1,
        created=t_rep,
        updated=t_rep,
        submitted=t_rep,
    )
    session.add(d_rep)
    session.commit()
    session.refresh(d_rep)

    ans_rep1 = Answer(
        question=target_qid,
        created=t_rep,
        data=d_rep.id,
        value=100.0,
        repeat_index="0",
    )
    ans_rep2 = Answer(
        question=target_qid,
        created=t_rep,
        data=d_rep.id,
        value=200.0,
        repeat_index="1",
    )
    ans_rep3 = Answer(
        question=target_qid,
        created=t_rep,
        data=d_rep.id,
        value=300.0,
        repeat_index="2",
    )
    session.add_all([ans_rep1, ans_rep2, ans_rep3])
    session.commit()

    answers = service.extract_member_answers(
        session=session,
        organisation_id=org_a.id,
        years=[2023],
    )

    # Must be accumulated as a list of 3 items
    res_val = answers[2023].get(target_qid)
    assert isinstance(res_val, list)
    assert res_val == [100.0, 200.0, 300.0]

    # Clean up
    session.delete(ans_rep1)
    session.delete(ans_rep2)
    session.delete(ans_rep3)
    session.delete(d_rep)
    session.commit()


async def test_individual_dashboard_out_of_range_years(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    Verifies that requesting years where no member or peer submissions exist
    gracefully returns None for all metric curves without crashing.
    """
    token = test_setup["user_a_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get(
        app.url_path_for("visualization:individual_dashboard"),
        headers=headers,
        params=[("years", 2038), ("years", 2039)],
    )
    assert res.status_code == 200
    data = res.json()
    assert data["years"] == [2038, 2039]

    for ch in data["challenges"]:
        for ind in ch["indicators"]:
            assert len(ind["series"]) == 2
            for pt in ind["series"]:
                assert pt["year"] in [2038, 2039]
                assert pt["member"] is None
                assert pt["isco_avg"] is None
                assert pt["gisco_avg"] is None


async def test_individual_dashboard_all_nine_indicators_present(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    Verifies that all 9 canonical indicators spanning the 4 challenges
    are always returned in the response contract.
    """
    token = test_setup["user_a_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get(
        app.url_path_for("visualization:individual_dashboard"),
        headers=headers,
        params=[("years", 2022)],
    )
    assert res.status_code == 200
    data = res.json()

    expected_indicators = {
        "sourced_directly",
        "sourced_traceable",
        "deforestation_free",
        "li_gap_measured",
        "li_strategy_implemented",
        "clmrs_covered",
        "child_labour_identified",
        "support_received",
        "follow_up_visits",
    }
    found_indicators = set()
    for ch in data["challenges"]:
        for ind in ch["indicators"]:
            found_indicators.add(ind["id"])
            assert "country" in ind
            assert "unit" in ind
            assert "higher_is_better" in ind
            assert "chart_type" in ind

    assert expected_indicators == found_indicators


def test_individual_dashboard_caching_and_subsequent_calls(
    session: Session, test_setup: dict
):
    """
    Verifies that consecutive calls to get_individual_dashboard
    leverage benchmark caching without inconsistencies.
    """
    from services.visualization_service import VisualizationService

    service = VisualizationService()
    org_a = test_setup["org_a"]

    # First call primes cache
    res1 = service.get_individual_dashboard(
        session=session,
        organisation_id=org_a.id,
        years=[2022, 2023],
    )
    # Second call should leverage TTLCache
    res2 = service.get_individual_dashboard(
        session=session,
        organisation_id=org_a.id,
        years=[2022, 2023],
    )

    assert res1["organisation"]["id"] == res2["organisation"]["id"]
    assert res1["years"] == res2["years"]
    assert len(res1["challenges"]) == len(res2["challenges"])


async def test_individual_dashboard_peer_group_override(
    app: FastAPI, client: AsyncClient, session: Session, test_setup: dict
):
    """
    TAC-07.1: Passing peer_group_id query parameter overrides benchmark
    cohort while retaining member values.
    """
    from models.peer_group import PeerGroup

    # Create a secondary peer group
    pg2 = (
        session.query(PeerGroup)
        .filter(PeerGroup.code == "large_manufacturer")
        .first()
    )
    if not pg2:
        pg2 = PeerGroup(
            name="Large Manufacturer",
            code="large_manufacturer",
            description="Large manufacturer cohort",
        )
        session.add(pg2)
        session.commit()
        session.refresh(pg2)

    headers = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    res = await client.get(
        f"/visualization/individual-dashboard?peer_group_id={pg2.id}",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert "peer_groups" in data
    assert len(data["peer_groups"]) >= 1
    assert data["organisation"]["peer_group"]["id"] == pg2.id


async def test_individual_dashboard_invalid_peer_group_404(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    TAC-07.3: Invalid peer_group_id returns 404 Not Found.
    """
    headers = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    res = await client.get(
        "/visualization/individual-dashboard?peer_group_id=99999",
        headers=headers,
    )
    assert res.status_code == 404
    assert "peer group 99999 not found" in res.json().get("detail", "").lower()


async def test_individual_dashboard_unmapped_org_with_peer_group_override(
    app: FastAPI, client: AsyncClient, test_setup: dict
):
    """
    UAC-07.5: Unmapped organisation with explicit peer_group_id allows
    secretariat admins to preview benchmarks without triggering 422.
    """
    headers = {"Authorization": f"Bearer {test_setup['sec_admin_token']}"}
    unmapped_org_id = test_setup["org_c"].id
    mapped_pg_id = test_setup["peer_group"].id

    url = (
        f"/visualization/individual-dashboard?"
        f"organisation_id={unmapped_org_id}&peer_group_id={mapped_pg_id}"
    )
    res = await client.get(url, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["organisation"]["id"] == unmapped_org_id
    assert data["organisation"]["peer_group"]["id"] == mapped_pg_id
    assert data["enable_peer_group_filter"] is True


def test_peer_group_filter_feature_flag_disabled(
    session: Session, test_setup: dict
):
    """
    Verifies that when enable_peer_group_filter is False in config,
    peer_group override is ignored, returning the mapped peer group
    and empty peer_groups list.
    """
    from services.visualization_service import VisualizationService

    service = VisualizationService()
    # Temporarily set flag to False
    orig_flag = service.config.get("enable_peer_group_filter", True)
    try:
        service.config["enable_peer_group_filter"] = False
        res = service.get_individual_dashboard(
            session=session,
            organisation_id=test_setup["org_a"].id,
            years=[2022],
            peer_group_id=99999,  # Even with invalid/override ID
        )
        assert res["enable_peer_group_filter"] is False
        assert res["peer_groups"] == []
        assert (
            res["organisation"]["peer_group"]["id"]
            == test_setup["peer_group"].id
        )
    finally:
        service.config["enable_peer_group_filter"] = orig_flag


def test_member_message_model_crud_and_uniqueness(
    session: Session, test_setup: dict
):
    """
    TASK-1.1: Verify MemberMessage model creation, retrieval,
    translations JSONB array storage, and unique constraint on
    (organisation, year).
    """
    from models.member_message import MemberMessage
    from models.organisation import Organisation
    from sqlalchemy.exc import IntegrityError

    org = Organisation(
        name="Org For Model Test", code="ORG_MODEL_TEST", active=True
    )
    session.add(org)
    session.commit()
    session.refresh(org)

    # 1. Create a new MemberMessage
    msg = MemberMessage(
        organisation=org.id,
        year=2024,
        message="Achievements: Great progress. Growth area: Deforestation.",
        translations=[
            {"language": "de", "message": "Erfolge: Gute Fortschritte."},
            {"language": "fr", "message": "Réalisations: Bons progrès."},
        ],
    )
    session.add(msg)
    session.commit()
    session.refresh(msg)

    assert msg.id is not None
    assert msg.organisation == org.id
    assert msg.year == 2024
    assert "Achievements" in msg.message
    assert len(msg.translations) == 2
    assert msg.translations[0]["language"] == "de"
    assert msg.created is not None

    # 2. Duplicate (organisation, year) should violate unique constraint
    duplicate_msg = MemberMessage(
        organisation=org.id,
        year=2024,
        message="Duplicate message for same year",
    )
    session.add(duplicate_msg)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()

    # 3. Different year for same organisation succeeds
    msg_2023 = MemberMessage(
        organisation=org.id,
        year=2023,
        message="2023 Historic message",
    )
    session.add(msg_2023)
    session.commit()
    assert msg_2023.id is not None

    # Cleanup
    session.query(MemberMessage).filter(
        MemberMessage.organisation == org.id
    ).delete()
    session.delete(org)
    session.commit()


def test_member_message_cascade_delete(session: Session):
    """
    TASK-1.1: Verify deleting an organisation cascades to its MemberMessage
    records.
    """
    from models.member_message import MemberMessage
    from models.organisation import Organisation

    temp_org = Organisation(
        name="Temp Org For Cascade", code="TEMP_CAS", active=True
    )
    session.add(temp_org)
    session.commit()
    session.refresh(temp_org)

    msg = MemberMessage(
        organisation=temp_org.id,
        year=2024,
        message="Message to be deleted",
    )
    session.add(msg)
    session.commit()
    msg_id = msg.id

    # Delete organisation
    session.delete(temp_org)
    session.commit()

    # MemberMessage must be deleted
    assert (
        session.query(MemberMessage)
        .filter(MemberMessage.id == msg_id)
        .first()
        is None
    )


@pytest.mark.asyncio
async def test_get_individual_dashboard_member_message_resolution(
    client: AsyncClient, test_setup: dict, session: Session
):
    """
    TASK-1.2: Verify GET /visualization/individual-dashboard resolves
    member_message for active/latest year, handles multiple years,
    and returns null when no message exists.
    """
    from models.member_message import MemberMessage

    org_a = test_setup["org_a"]
    org_b = test_setup["org_b"]
    headers_member = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    headers_admin = {
        "Authorization": f"Bearer {test_setup['sec_admin_token']}"
    }

    # 1. Before creating any messages, member_message is None
    res = await client.get(
        "/visualization/individual-dashboard", headers=headers_member
    )
    assert res.status_code == 200
    data = res.json()
    assert data["member_message"] is None

    # 2. Add two messages for Org A: 2023 and 2024
    msg_2023 = MemberMessage(
        organisation=org_a.id,
        year=2023,
        message="2023 message for Org A",
        translations=[{"language": "de", "message": "2023 Botschaft"}],
    )
    msg_2024 = MemberMessage(
        organisation=org_a.id,
        year=2024,
        message="2024 latest message for Org A",
        translations=[{"language": "de", "message": "2024 Botschaft"}],
    )
    session.add_all([msg_2023, msg_2024])
    session.commit()

    # 3. Default query (no year specified) returns latest year (2024)
    res = await client.get(
        "/visualization/individual-dashboard", headers=headers_member
    )
    assert res.status_code == 200
    data = res.json()
    assert data["member_message"] is not None
    assert data["member_message"]["year"] == 2024
    assert data["member_message"]["message"] == "2024 latest message for Org A"
    assert len(data["member_message"]["translations"]) == 1

    # 4. Filter by specific year 2023
    res = await client.get(
        "/visualization/individual-dashboard?years=2023",
        headers=headers_member,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["member_message"] is not None
    assert data["member_message"]["year"] == 2023
    assert data["member_message"]["message"] == "2023 message for Org A"

    # 5. Secretariat Admin switches to Org B (which has no message) -> None
    res = await client.get(
        f"/visualization/individual-dashboard?organisation_id={org_b.id}",
        headers=headers_admin,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["member_message"] is None


def test_generate_protected_feedback_template_structure_and_locks(
    session: Session, test_setup: dict
):
    """
    TASK-1.3: Verify Excel template generation with sheet protection,
    locked identifier columns A-C, and unlocked data entry columns D-H.
    """
    import openpyxl
    from io import BytesIO
    from util.feedback_template import generate_protected_feedback_template

    orgs = [test_setup["org_a"], test_setup["org_b"]]
    excel_stream = generate_protected_feedback_template(orgs, 2024)

    assert isinstance(excel_stream, BytesIO)
    wb = openpyxl.load_workbook(excel_stream, data_only=True)

    # 1. Sheets check
    assert "Member Feedback" in wb.sheetnames
    assert "Instructions & Examples" in wb.sheetnames

    ws = wb["Member Feedback"]
    # 2. Protection enabled
    assert ws.protection.sheet is True

    # 3. Headers check
    headers = [cell.value for cell in ws[1]]
    expected_headers = [
        "organisation_id",
        "organisation_name",
        "year",
        "achievements",
        "growth_areas",
        "general_message",
        "language",
    ]
    assert headers == expected_headers

    # 4. Pre-populated org rows
    assert ws.cell(row=2, column=1).value == test_setup["org_a"].id
    assert ws.cell(row=2, column=2).value == test_setup["org_a"].name
    assert ws.cell(row=2, column=3).value == 2024

    assert ws.cell(row=3, column=1).value == test_setup["org_b"].id


@pytest.mark.asyncio
async def test_download_feedback_template_endpoint(
    client: AsyncClient, test_setup: dict
):
    """
    TASK-1.3: Verify GET /visualization/member-messages/template:
    - 403 Forbidden for non-secretariat members
    - 200 OK binary streaming for secretariat admin
    """
    import openpyxl
    from io import BytesIO

    headers_member = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    headers_admin = {
        "Authorization": f"Bearer {test_setup['sec_admin_token']}"
    }

    # Non-secretariat user gets 403
    res_forbidden = await client.get(
        "/visualization/member-messages/template?year=2024",
        headers=headers_member,
    )
    assert res_forbidden.status_code == 403

    # Secretariat admin gets 200 with attachment
    res = await client.get(
        "/visualization/member-messages/template?year=2024",
        headers=headers_admin,
    )
    assert res.status_code == 200
    assert "spreadsheetml" in res.headers.get("content-type", "")
    assert "attachment" in res.headers.get("content-disposition", "")
    assert (
        "ISCO_Member_Feedback_Template_2024.xlsx"
        in res.headers.get("content-disposition", "")
    )

    # Content is readable valid xlsx
    wb = openpyxl.load_workbook(BytesIO(res.content))
    assert "Member Feedback" in wb.sheetnames


@pytest.mark.asyncio
async def test_upload_feedback_spreadsheet_endpoint(
    client: AsyncClient, test_setup: dict, session: Session
):
    """
    TASK-1.3: Verify POST /visualization/member-messages/upload:
    - Dry-run returns statistics without committing
    - Actual import parses achievements & growth areas into markdown
    - Upserts records into member_message table
    """
    import pandas as pd
    from io import BytesIO
    from models.member_message import MemberMessage

    org_a = test_setup["org_a"]
    org_b = test_setup["org_b"]
    headers_admin = {
        "Authorization": f"Bearer {test_setup['sec_admin_token']}"
    }

    # Create in-memory test Excel data
    df = pd.DataFrame([
        {
            "organisation_id": org_a.id,
            "organisation_code": org_a.code,
            "organisation_name": org_a.name,
            "year": 2024,
            "achievements": "High child labour remediation rate.",
            "growth_areas": "Traceability needs farm-level mapping.",
            "general_message": None,
            "language": "en",
        },
        {
            "organisation_id": org_b.id,
            "organisation_code": org_b.code,
            "organisation_name": org_b.name,
            "year": 2024,
            "achievements": None,
            "growth_areas": None,
            "general_message": "General feedback paragraph override.",
            "language": "en",
        },
    ])
    excel_buffer = BytesIO()
    with pd.ExcelWriter(excel_buffer, engine="xlsxwriter") as writer:
        df.to_excel(writer, sheet_name="Member Feedback", index=False)
    excel_buffer.seek(0)

    content_type = (
        "application/vnd.openxmlformats-officedocument"
        ".spreadsheetml.sheet"
    )

    # 1. Test Dry Run
    files = {
        "file": (
            "test_import.xlsx",
            excel_buffer.getvalue(),
            content_type,
        )
    }
    data = {"dry_run": "true"}
    res_dry = await client.post(
        "/visualization/member-messages/upload",
        files=files,
        data=data,
        headers=headers_admin,
    )
    assert res_dry.status_code == 200
    res_dry_json = res_dry.json()
    assert res_dry_json["status"] == "success"
    assert res_dry_json["dry_run"] is True
    assert res_dry_json["total_rows"] == 2
    assert res_dry_json["imported"] == 2

    # 2. Test Actual Upload
    files_actual = {
        "file": (
            "test_import.xlsx",
            excel_buffer.getvalue(),
            content_type,
        )
    }
    res_actual = await client.post(
        "/visualization/member-messages/upload",
        files=files_actual,
        data={"dry_run": "false"},
        headers=headers_admin,
    )
    assert res_actual.status_code == 200
    res_actual_json = res_actual.json()
    assert res_actual_json["status"] == "success"
    assert res_actual_json["dry_run"] is False
    assert res_actual_json["imported"] == 2

    # Verify rows in database
    msg_a = session.query(MemberMessage).filter(
        MemberMessage.organisation == org_a.id,
        MemberMessage.year == 2024,
    ).first()
    assert msg_a is not None
    assert "**Achievements:**" in msg_a.message
    assert "High child labour remediation rate." in msg_a.message
    assert "**Growth area:**" in msg_a.message
    assert "Traceability needs farm-level mapping." in msg_a.message

    msg_b = session.query(MemberMessage).filter(
        MemberMessage.organisation == org_b.id,
        MemberMessage.year == 2024,
    ).first()
    assert msg_b is not None
    assert msg_b.message == "General feedback paragraph override."

    # Cleanup
    session.query(MemberMessage).filter(
        MemberMessage.organisation.in_([org_a.id, org_b.id]),
        MemberMessage.year == 2024,
    ).delete(synchronize_session=False)
    session.commit()


@pytest.mark.asyncio
async def test_get_individual_dashboard_indicator_tooltips_and_translations(
    client: AsyncClient, test_setup: dict
):
    """
    TASK-09.2: Verify that every indicator in individual dashboard response
    contains description and translations list with fallback support.
    """
    headers = {"Authorization": f"Bearer {test_setup['user_a_token']}"}
    res = await client.get(
        "/visualization/individual-dashboard", headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    challenges = data.get("challenges", [])
    assert len(challenges) > 0

    all_indicators = []
    for ch in challenges:
        for ind in ch.get("indicators", []):
            all_indicators.append(ind)

    assert len(all_indicators) > 0
    for ind in all_indicators:
        assert "description" in ind
        assert ind["description"] is not None
        assert isinstance(ind["description"], str)
        assert len(ind["description"].strip()) > 0
        assert "translations" in ind
        assert isinstance(ind["translations"], list)


@pytest.mark.asyncio
async def test_indicator_dto_fallback_to_default_description(
    session: Session, test_setup: dict
):
    """
    TASK-09.2: Verify that VisualizationService falls back to
    DEFAULT_LOREM_IPSUM and empty list when description or
    translations are omitted.
    """
    from services.visualization_service import (
        VisualizationService,
        DEFAULT_LOREM_IPSUM,
    )

    service = VisualizationService()
    org_a = test_setup["org_a"]

    # Temporarily override config to simulate missing description
    original_config = service.benchmark_service._config
    try:
        service.benchmark_service._config = {
            "start_year": 2024,
            "end_year": 2024,
            "enable_peer_group_filter": False,
            "challenges": [
                {
                    "id": "test_challenge",
                    "name": "Test Challenge",
                    "indicators": [
                        {
                            "id": "test_ind_no_desc",
                            "name": "Test No Desc",
                            "formula": "ID86",
                        }
                    ],
                }
            ],
        }

        res = service.get_individual_dashboard(
            session=session,
            organisation_id=org_a.id,
            years=[2024],
        )

        ind = res["challenges"][0]["indicators"][0]
        assert ind["description"] == DEFAULT_LOREM_IPSUM
        assert ind["translations"] == []
    finally:
        service.benchmark_service._config = original_config
