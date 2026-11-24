"""create member_message table

Revision ID: a1b2c3d4e5f6
Revises: 857e7a330177
Create Date: 2026-11-24 11:15:00.000000

Architecture Note:
    - Creates `member_message` table for annual qualitative feedback per member organization.
    - Foreign key to `organisation.id` with cascade deletion.
    - Unique constraint `uq_member_message_org_year` on `(organisation, year)`.
    - Multilingual translation column using ISCO standard `ARRAY(JSONB)`.
"""

from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "857e7a330177"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "member_message",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("organisation", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("translations", pg.ARRAY(pg.JSONB), nullable=True),
        sa.Column(
            "created",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["organisation"],
            ["organisation.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "organisation",
            "year",
            name="uq_member_message_org_year",
        ),
    )
    op.create_index(
        op.f("ix_member_message_id"),
        "member_message",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_member_message_organisation"),
        "member_message",
        ["organisation"],
        unique=False,
    )
    op.create_index(
        op.f("ix_member_message_year"),
        "member_message",
        ["year"],
        unique=False,
    )


def downgrade():
    op.drop_index(
        op.f("ix_member_message_year"),
        table_name="member_message",
    )
    op.drop_index(
        op.f("ix_member_message_organisation"),
        table_name="member_message",
    )
    op.drop_index(
        op.f("ix_member_message_id"),
        table_name="member_message",
    )
    op.drop_table("member_message")
