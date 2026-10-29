import pytest
from datetime import datetime
from fastapi import HTTPException
from models.member_type import MemberType
from models.peer_group import (
    PeerGroup,
    PeerGroupMemberType,
    PeerGroupPayload,
    PeerGroupMemberTypePayload,
)
from db.crud_peer_group import (
    add_peer_group,
    get_peer_groups,
    get_peer_group_by_id,
    get_peer_group_by_code,
    update_peer_group,
    delete_peer_group,
    add_peer_group_member_type,
    get_peer_group_for_member_type,
    get_peer_groups_with_mappings,
    sync_peer_group_member_types,
    reconcile_peer_group_mappings,
)


def test_peer_group_and_member_type_models():
    """Verify model initialization, repr, and serialization."""
    now = datetime.utcnow()
    pg = PeerGroup(
        id=999,
        name="Test Cohort",
        code="test_cohort",
        description="A test peer group description",
        created=now,
    )
    assert pg.id == 999
    assert pg.name == "Test Cohort"
    assert pg.code == "test_cohort"
    assert repr(pg) == "<PeerGroup 999: test_cohort>"
    serialized = pg.serialize
    assert serialized["id"] == 999
    assert serialized["code"] == "test_cohort"
    assert serialized["name"] == "Test Cohort"
    assert serialized["description"] == "A test peer group description"
    assert serialized["created"] == now.strftime("%Y-%m-%d %H:%M:%S")

    pg_mt = PeerGroupMemberType(
        id=888,
        peer_group_id=999,
        member_type_id=1,
        isco_scope="GISCO",
    )
    assert pg_mt.id == 888
    assert pg_mt.peer_group_id == 999
    assert pg_mt.member_type_id == 1
    assert pg_mt.isco_scope == "GISCO"
    assert "peer_group=999" in repr(pg_mt)
    serialized_mt = pg_mt.serialize
    assert serialized_mt["id"] == 888
    assert serialized_mt["peer_group_id"] == 999
    assert serialized_mt["member_type_id"] == 1
    assert serialized_mt["isco_scope"] == "GISCO"


def test_peer_group_crud_lifecycle(session):
    """
    TAC-01.1 & TAC-01.4:
    Verify create, read, update, delete operations on PeerGroup and mappings.
    """
    # Clean up any leftover test artifact
    leftover = (
        session.query(PeerGroup)
        .filter(PeerGroup.code == "coop_union")
        .first()
    )
    if leftover:
        delete_peer_group(session=session, id=leftover.id)

    payload: PeerGroupPayload = {
        "name": "Cooperative Union",
        "code": "coop_union",
        "description": "Smallholder cooperatives",
    }
    pg = add_peer_group(session=session, payload=payload)
    assert pg.id is not None
    assert pg.code == "coop_union"

    # Query by ID and code
    fetched_by_id = get_peer_group_by_id(session=session, id=pg.id)
    assert fetched_by_id.code == "coop_union"
    fetched_by_code = get_peer_group_by_code(
        session=session, code="coop_union"
    )
    assert fetched_by_code.id == pg.id

    # Update
    update_payload: PeerGroupPayload = {
        "name": "Smallholder Cooperative Union",
        "code": "coop_union",
        "description": "Updated description",
    }
    updated = update_peer_group(
        session=session, id=pg.id, payload=update_payload
    )
    assert updated.name == "Smallholder Cooperative Union"
    assert updated.description == "Updated description"

    # Create dedicated dummy member type to link
    mt = MemberType(id=99988, name="Lifecycle Test Exclusive MT")
    session.add(mt)
    session.commit()

    mt_payload: PeerGroupMemberTypePayload = {
        "peer_group_id": pg.id,
        "member_type_id": mt.id,
        "isco_scope": "ALL",
    }
    mapping = add_peer_group_member_type(session=session, payload=mt_payload)
    assert mapping.id is not None

    # Verify resolution helper
    resolved_pg = get_peer_group_for_member_type(
        session=session, member_type_id=mt.id
    )
    assert resolved_pg is not None
    assert resolved_pg.id == pg.id
    assert resolved_pg.code == "coop_union"

    # Verify Cascade Delete: deleting peer_group deletes mapping
    mapping_id = mapping.id
    delete_peer_group(session=session, id=pg.id)

    # Peer group should no longer exist
    with pytest.raises(HTTPException):
        get_peer_group_by_id(session=session, id=pg.id)

    # Mapping should have been cascade deleted
    remaining_mapping = (
        session.query(PeerGroupMemberType)
        .filter(PeerGroupMemberType.id == mapping_id)
        .first()
    )
    assert remaining_mapping is None
    session.delete(mt)
    session.commit()


def test_seeded_4_harmonized_peer_groups(session):
    """
    UAC-01.1 & TAC-01.2:
    Verifies that the migration seeded the 4 harmonized peer groups:
    - trader_processor
    - large_manufacturer
    - sme
    - retail
    """
    all_groups = get_peer_groups(session=session)
    codes = {g.code: g for g in all_groups}

    assert "trader_processor" in codes, "trader_processor group must exist"
    assert "large_manufacturer" in codes, "large_manufacturer group must exist"
    assert "sme" in codes, "sme group must exist"
    assert "retail" in codes, "retail group must exist"

    # Verify trader_processor name & member types
    tp = codes["trader_processor"]
    assert tp.name == "Trader/Processor"

    # Verify large_manufacturer
    lm = codes["large_manufacturer"]
    assert lm.name == "Large Manufacturer"

    # Verify SME
    sme = codes["sme"]
    assert sme.name == "SME"

    # Verify Retail
    retail = codes["retail"]
    assert retail.name == "Retail"


def test_member_type_to_peer_group_resolution(session):
    """
    UAC-01.2 & TAC-01.4:
    Verifies that member types resolve to their harmonized peer groups.
    """
    test_cases = [
        ("Trader GISCO", "trader_processor"),
        ("DISCO - Traders", "trader_processor"),
        ("Industry", "large_manufacturer"),
        ("GISCO - Small Industry", "sme"),
        ("Small Industry", "sme"),
        ("Retail GISCO", "retail"),
        ("Retail DISCO", "retail"),
    ]

    created_mts = []
    for mt_name, _ in test_cases:
        mt = session.query(MemberType).filter(
            MemberType.name == mt_name
        ).first()
        if not mt:
            mt = MemberType(id=None, name=mt_name)
            session.add(mt)
            session.commit()
            created_mts.append(mt)

    reconcile_peer_group_mappings(session=session)

    for mt_name, expected_pg_code in test_cases:
        mt = session.query(MemberType).filter(
            MemberType.name == mt_name
        ).first()
        assert mt is not None
        pg = get_peer_group_for_member_type(
            session=session, member_type_id=mt.id
        )
        assert pg is not None, (
            f"MemberType '{mt_name}' should map to a peer group"
        )
        assert pg.code == expected_pg_code, (
            f"MemberType '{mt_name}' should map to '{expected_pg_code}', "
            f"got '{pg.code}'"
        )

    # Clean up test member types created by this test
    if created_mts:
        mt_ids = [m.id for m in created_mts]
        session.query(PeerGroupMemberType).filter(
            PeerGroupMemberType.member_type_id.in_(mt_ids)
        ).delete(synchronize_session=False)
        session.query(MemberType).filter(
            MemberType.id.in_(mt_ids)
        ).delete(synchronize_session=False)
        session.commit()


def test_nonexistent_member_type_resolution(session):
    """Verifies that an unmapped member type safely returns None."""
    resolved = get_peer_group_for_member_type(
        session=session, member_type_id=9999999
    )
    assert resolved is None


def test_peer_group_serialize_with_mappings_and_sync(session):
    """Verify serialize_with_mappings and sync_peer_group_member_types."""
    groups = get_peer_groups_with_mappings(session=session)
    assert len(groups) >= 4
    for g in groups:
        assert "member_types" in g
        assert isinstance(g["member_types"], list)

    sync_pg = add_peer_group(
        session=session,
        payload={
            "name": "Sync Test Peer Group",
            "code": "sync_test_pg",
            "description": "For sync testing",
        },
    )
    mts = session.query(MemberType).limit(3).all()
    target_ids = [m.id for m in mts]

    updated = sync_peer_group_member_types(
        session=session, peer_group_id=sync_pg.id, member_type_ids=target_ids
    )
    assert len(updated["member_types"]) == 3

    # Invalid ID
    with pytest.raises(HTTPException):
        sync_peer_group_member_types(
            session=session,
            peer_group_id=sync_pg.id,
            member_type_ids=[99999999],
        )
    delete_peer_group(session=session, id=sync_pg.id)
