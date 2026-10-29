import pytest
from datetime import datetime
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from models.user import User, UserRole
from models.organisation import Organisation
from models.member_type import MemberType
from models.peer_group import PeerGroup
from middleware import create_access_token

pytestmark = pytest.mark.asyncio


def _get_or_create_test_org(session: Session) -> Organisation:
    org = session.query(Organisation).first()
    if not org:
        org = Organisation(code="TEST", name="Test Org", active=True)
        session.add(org)
        session.commit()
        session.refresh(org)
    return org


@pytest.fixture
def secretariat_admin_token(session: Session) -> str:
    """Fixture returning valid JWT token for a secretariat_admin user."""
    user = (
        session.query(User)
        .filter(User.role == UserRole.secretariat_admin)
        .first()
    )
    if not user:
        org = _get_or_create_test_org(session)
        user = User(
            name="Secretariat Admin Test",
            email="secretariat_admin_test@akvo.org",
            phone_number="12345",
            password="hashed_pw",
            role=UserRole.secretariat_admin,
            approved=True,
            organisation=org.id,
        )
        user.email_verified = datetime.utcnow()
        session.add(user)
        session.commit()
    elif not user.email_verified:
        user.email_verified = datetime.utcnow()
        session.commit()

    token = create_access_token(data={"email": user.email})
    return token.get("token")


@pytest.fixture
def member_user_token(session: Session) -> str:
    """Fixture returning valid JWT token for a regular member user."""
    user = (
        session.query(User)
        .filter(User.role == UserRole.member_user)
        .first()
    )
    if not user:
        org = _get_or_create_test_org(session)
        user = User(
            name="Member User Test",
            email="member_user_test@akvo.org",
            phone_number="12345",
            password="hashed_pw",
            role=UserRole.member_user,
            approved=True,
            organisation=org.id,
        )
        user.email_verified = datetime.utcnow()
        session.add(user)
        session.commit()
    elif not user.email_verified:
        user.email_verified = datetime.utcnow()
        session.commit()

    token = create_access_token(data={"email": user.email})
    return token.get("token")


async def test_get_peer_groups_unauthenticated(
    app: FastAPI, client: AsyncClient
):
    """TAC-01B.1: Rejects unauthenticated requests with 401/403."""
    res = await client.get(app.url_path_for("peer_group:get_all"))
    assert res.status_code in [401, 403]


async def test_get_peer_groups_forbidden_for_member_user(
    app: FastAPI, client: AsyncClient, member_user_token: str
):
    """TAC-01B.1: Rejects non-super-admin with 403 Forbidden."""
    headers = {"Authorization": f"Bearer {member_user_token}"}
    res = await client.get(
        app.url_path_for("peer_group:get_all"), headers=headers
    )
    assert res.status_code == 403
    assert "super admin only" in res.json().get("detail", "").lower()


async def test_get_peer_groups_success_for_secretariat_admin(
    app: FastAPI, client: AsyncClient, secretariat_admin_token: str
):
    """UAC-01B.2: Returns all peer groups with mapped member types."""
    headers = {"Authorization": f"Bearer {secretariat_admin_token}"}
    res = await client.get(
        app.url_path_for("peer_group:get_all"), headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    codes = [g["code"] for g in data]
    assert "trader_processor" in codes
    assert "large_manufacturer" in codes
    assert "sme" in codes
    assert "retail" in codes
    for group in data:
        assert "id" in group
        assert "name" in group
        assert "member_types" in group
        assert isinstance(group["member_types"], list)


async def test_get_peer_group_by_id(
    app: FastAPI, client: AsyncClient, secretariat_admin_token: str,
    session: Session
):
    """Verifies GET /peer_group/{id}."""
    first_pg = session.query(PeerGroup).first()
    headers = {"Authorization": f"Bearer {secretariat_admin_token}"}
    res = await client.get(
        app.url_path_for("peer_group:get_by_id", id=first_pg.id),
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == first_pg.id
    assert data["code"] == first_pg.code


async def test_update_peer_group_mappings_atomic(
    app: FastAPI, client: AsyncClient, secretariat_admin_token: str,
    session: Session
):
    """
    TAC-01B.2 & UAC-01B.3:
    Atomically updates member types mapped to a peer group.
    """
    target_pg = PeerGroup(
        name="Route Test Group",
        code="route_test_group",
        description="Temp group for mapping update route tests",
    )
    session.add(target_pg)
    session.commit()
    session.refresh(target_pg)
    headers = {"Authorization": f"Bearer {secretariat_admin_token}"}

    # Fetch two member types
    mts = session.query(MemberType).limit(2).all()
    new_ids = [m.id for m in mts]

    payload = {"member_type_ids": new_ids}
    res = await client.put(
        app.url_path_for("peer_group:update_mappings", id=target_pg.id),
        json=payload,
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    mapped_ids = [mt["id"] for mt in data["member_types"]]
    assert sorted(mapped_ids) == sorted(new_ids)

    # Empty list clears mappings safely
    res_empty = await client.put(
        app.url_path_for("peer_group:update_mappings", id=target_pg.id),
        json={"member_type_ids": []},
        headers=headers,
    )
    assert res_empty.status_code == 200
    assert len(res_empty.json()["member_types"]) == 0

    # Clean up test peer group
    session.delete(target_pg)
    session.commit()


async def test_update_mappings_invalid_member_type(
    app: FastAPI, client: AsyncClient, secretariat_admin_token: str,
    session: Session
):
    """Rejects invalid member type IDs with 422 Unprocessable Entity."""
    first_pg = session.query(PeerGroup).first()
    headers = {"Authorization": f"Bearer {secretariat_admin_token}"}
    payload = {"member_type_ids": [99999999]}
    res = await client.put(
        app.url_path_for("peer_group:update_mappings", id=first_pg.id),
        json=payload,
        headers=headers,
    )
    assert res.status_code == 422
    assert "member types not found" in res.json().get("detail", "").lower()
