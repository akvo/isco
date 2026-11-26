"""create peer_group and peer_group_member_type tables

Revision ID: 857e7a330177
Revises: 9f3c1b82a74e
Create Date: 2026-10-29 17:05:00.000000

Architecture Note:
    - This migration strictly handles DDL (creating `peer_group` and
      `peer_group_member_type` tables, foreign keys, and indices) and seeds
      the 4 foundational harmonized peer group structural rows.
    - Initial mappings between peer groups and `member_type` are managed
      via the idempotent seeder `python -m seeder.peer_group` and the
      Secretariat Admin UI (/manage-peer-group) to preserve migration
      determinism across fresh test and production databases.
"""

from datetime import datetime
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "857e7a330177"
down_revision = "9f3c1b82a74e"
branch_labels = None
depends_on = None

FOUNDATIONAL_PEER_GROUPS = [
    (
        "Trader/Processor",
        "trader_processor",
        "Traders and cocoa processors cohort",
    ),
    (
        "Large Manufacturer",
        "large_manufacturer",
        "Large industrial cocoa & chocolate manufacturers",
    ),
    (
        "SME",
        "sme",
        "Small and medium enterprises / manufacturers",
    ),
    (
        "Retail",
        "retail",
        "Retailers cohort",
    ),
]


def upgrade():
    # 1. Create peer_group table
    op.create_table(
        "peer_group",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_peer_group_id"),
        "peer_group",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_peer_group_code"),
        "peer_group",
        ["code"],
        unique=True,
    )

    # 2. Create peer_group_member_type table
    op.create_table(
        "peer_group_member_type",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("peer_group_id", sa.Integer(), nullable=False),
        sa.Column("member_type_id", sa.Integer(), nullable=False),
        sa.Column(
            "isco_scope",
            sa.String(),
            nullable=False,
            server_default="ALL",
        ),
        sa.ForeignKeyConstraint(
            ["peer_group_id"],
            ["peer_group.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["member_type_id"],
            ["member_type.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "peer_group_id",
            "member_type_id",
            name="uix_peer_group_member_type",
        ),
    )
    op.create_index(
        op.f("ix_peer_group_member_type_id"),
        "peer_group_member_type",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_peer_group_member_type_peer_group_id"),
        "peer_group_member_type",
        ["peer_group_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_peer_group_member_type_member_type_id"),
        "peer_group_member_type",
        ["member_type_id"],
        unique=False,
    )

    # 3. Seed 4 Foundational Harmonized Peer Groups
    bind = op.get_bind()
    peer_group_tbl = sa.table(
        "peer_group",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("code", sa.String),
        sa.column("description", sa.Text),
        sa.column("created", sa.DateTime),
    )
    now = datetime.utcnow()
    for name, code, desc in FOUNDATIONAL_PEER_GROUPS:
        existing = bind.execute(
            sa.select([peer_group_tbl.c.id]).where(
                peer_group_tbl.c.code == code
            )
        ).fetchone()
        if not existing:
            bind.execute(
                peer_group_tbl.insert().values(
                    name=name,
                    code=code,
                    description=desc,
                    created=now,
                )
            )


def downgrade():
    op.drop_index(
        op.f("ix_peer_group_member_type_member_type_id"),
        table_name="peer_group_member_type",
    )
    op.drop_index(
        op.f("ix_peer_group_member_type_peer_group_id"),
        table_name="peer_group_member_type",
    )
    op.drop_index(
        op.f("ix_peer_group_member_type_id"),
        table_name="peer_group_member_type",
    )
    op.drop_table("peer_group_member_type")
    op.drop_index(op.f("ix_peer_group_code"), table_name="peer_group")
    op.drop_index(op.f("ix_peer_group_id"), table_name="peer_group")
    op.drop_table("peer_group")
