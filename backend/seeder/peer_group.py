"""
Peer Group & Member Type Mapping Seeder

Usage:
    ./dc.sh exec backend python -m seeder.peer_group

What it does:
    1. Ensures the 4 harmonized peer groups ('trader_processor',
       'large_manufacturer', 'sme', 'retail') exist in the `peer_group`
       table based on the canonical definition in
       `seeder.static.static_peer_group.PEER_GROUPS`.
    2. Idempotently reconciles and creates mappings in `peer_group_member_type`
       for any existing `member_type` records matching the canonical list.
    3. Safe to run repeatedly (zero duplicate rows, non-destructive).
"""

from db.connection import Base, SessionLocal, engine
from seeder.static.static_peer_group import PEER_GROUPS
from db.crud_peer_group import (
    reconcile_peer_group_mappings,
    get_peer_groups,
    add_peer_group,
)

Base.metadata.create_all(bind=engine)
session = SessionLocal()

existing_groups = {g.code: g for g in get_peer_groups(session=session)}
for pg_def in PEER_GROUPS:
    if pg_def["code"] not in existing_groups:
        add_peer_group(
            session=session,
            payload={
                "name": pg_def["name"],
                "code": pg_def["code"],
                "description": pg_def.get("description"),
            },
        )
        print(f"Created peer group: {pg_def['name']}")

mapped = reconcile_peer_group_mappings(session=session)
print(f"Seeding Peer Group Mappings Done: {mapped} mappings reconciled.")
session.close()
