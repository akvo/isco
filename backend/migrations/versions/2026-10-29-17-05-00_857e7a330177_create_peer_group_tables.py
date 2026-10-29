"""create peer_group and peer_group_member_type tables and seed

Revision ID: 857e7a330177
Revises: 9f3c1b82a74e
Create Date: 2026-10-29 17:05:00.000000

"""
from datetime import datetime
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '857e7a330177'
down_revision = '9f3c1b82a74e'
branch_labels = None
depends_on = None

# 4 Harmonized Peer Groups definitions and their mapped member_type names
PEER_GROUPS = [
    {
        "code": "trader_processor",
        "name": "Trader/Processor",
        "description": "Traders and cocoa processors cohort",
        "member_types": [
            "Trader GISCO",
            "FRISCO-Trader",
            "DISCO - Traders",
            "Trader SWISSCO",
        ],
    },
    {
        "code": "large_manufacturer",
        "name": "Large Manufacturer",
        "description": "Large industrial cocoa & chocolate manufacturers",
        "member_types": [
            "Industry",
            "Big Industry",
            "DISCO - Large Manufacturers",
        ],
    },
    {
        "code": "sme",
        "name": "SME",
        "description": "Small and medium enterprises / manufacturers",
        "member_types": [
            "GISCO - Small Industry",
            "GISCO small industry",
            "SWISSCO - SME",
            "SWISSCO SME",
            "Small Industry",
            "DISCO - Small Manufacturers",
            "DISCO small manufacturers",
            "Beyond Chocolate Small Industry",
            "Beyond Chocolate Small industry",
        ],
    },
    {
        "code": "retail",
        "name": "Retail",
        "description": "Retailers cohort",
        "member_types": [
            "Retail GISCO",
            "Retail SWISSCO",
            "Retail GISCO SWISSCO",
            "Retail FRISCO",
            "Retail DISCO",
            "Retail BC",
            "DISCO - Retail",
            "Retail",
        ],
    },
]


def upgrade():
    # 1. Create peer_group table
    op.create_table(
        'peer_group',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_peer_group_id'),
        'peer_group',
        ['id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_peer_group_code'),
        'peer_group',
        ['code'],
        unique=True,
    )

    # 2. Create peer_group_member_type table
    op.create_table(
        'peer_group_member_type',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('peer_group_id', sa.Integer(), nullable=False),
        sa.Column('member_type_id', sa.Integer(), nullable=False),
        sa.Column(
            'isco_scope',
            sa.String(),
            nullable=False,
            server_default='ALL',
        ),
        sa.ForeignKeyConstraint(
            ['peer_group_id'],
            ['peer_group.id'],
            ondelete='CASCADE',
        ),
        sa.ForeignKeyConstraint(
            ['member_type_id'],
            ['member_type.id'],
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'peer_group_id',
            'member_type_id',
            name='uix_peer_group_member_type',
        ),
    )
    op.create_index(
        op.f('ix_peer_group_member_type_id'),
        'peer_group_member_type',
        ['id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_peer_group_member_type_peer_group_id'),
        'peer_group_member_type',
        ['peer_group_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_peer_group_member_type_member_type_id'),
        'peer_group_member_type',
        ['member_type_id'],
        unique=False,
    )

    # 3. Seed Harmonized Peer Groups and Mappings
    bind = op.get_bind()
    peer_group_tbl = sa.table(
        'peer_group',
        sa.column('id', sa.Integer),
        sa.column('name', sa.String),
        sa.column('code', sa.String),
        sa.column('description', sa.Text),
        sa.column('created', sa.DateTime),
    )
    peer_group_member_type_tbl = sa.table(
        'peer_group_member_type',
        sa.column('peer_group_id', sa.Integer),
        sa.column('member_type_id', sa.Integer),
        sa.column('isco_scope', sa.String),
    )
    member_type_tbl = sa.table(
        'member_type',
        sa.column('id', sa.Integer),
        sa.column('name', sa.String),
    )

    now = datetime.utcnow()
    for pg in PEER_GROUPS:
        # Check if already exists (idempotent)
        existing_pg = bind.execute(
            sa.select([peer_group_tbl.c.id]).where(
                peer_group_tbl.c.code == pg["code"]
            )
        ).fetchone()

        if existing_pg:
            pg_id = existing_pg[0]
        else:
            bind.execute(
                peer_group_tbl.insert().values(
                    name=pg["name"],
                    code=pg["code"],
                    description=pg["description"],
                    created=now,
                )
            )
            created_pg = bind.execute(
                sa.select([peer_group_tbl.c.id]).where(
                    peer_group_tbl.c.code == pg["code"]
                )
            ).fetchone()
            pg_id = created_pg[0]

        # Map member_type records
        for m_name in pg["member_types"]:
            # Case-insensitive match on member_type name
            matching_mt = bind.execute(
                sa.select([member_type_tbl.c.id]).where(
                    sa.func.lower(member_type_tbl.c.name) == m_name.lower()
                )
            ).fetchall()

            for mt_row in matching_mt:
                mt_id = mt_row[0]
                existing_map = bind.execute(
                    sa.select(
                        [peer_group_member_type_tbl.c.peer_group_id]
                    ).where(
                        sa.and_(
                            peer_group_member_type_tbl.c.peer_group_id
                            == pg_id,
                            peer_group_member_type_tbl.c.member_type_id
                            == mt_id,
                        )
                    )
                ).fetchone()

                if not existing_map:
                    bind.execute(
                        peer_group_member_type_tbl.insert().values(
                            peer_group_id=pg_id,
                            member_type_id=mt_id,
                            isco_scope='ALL',
                        )
                    )


def downgrade():
    op.drop_index(
        op.f('ix_peer_group_member_type_member_type_id'),
        table_name='peer_group_member_type',
    )
    op.drop_index(
        op.f('ix_peer_group_member_type_peer_group_id'),
        table_name='peer_group_member_type',
    )
    op.drop_index(
        op.f('ix_peer_group_member_type_id'),
        table_name='peer_group_member_type',
    )
    op.drop_table('peer_group_member_type')
    op.drop_index(op.f('ix_peer_group_code'), table_name='peer_group')
    op.drop_index(op.f('ix_peer_group_id'), table_name='peer_group')
    op.drop_table('peer_group')
