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
    detail = res.json().get("detail", "").lower()
    assert (
        "no mapped member type" in detail
        or "no mapped peer group" in detail
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
