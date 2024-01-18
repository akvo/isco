"""add autofield column to question table

Revision ID: 0caa3e1da199
Revises: 74250a003510
Create Date: 2024-01-18 06:24:17.376001

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = "0caa3e1da199"
down_revision = "74250a003510"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "question",
        sa.Column("autofield", pg.JSONB(), default=None, nullable=True),
    )


def downgrade():
    op.drop_column("question", "autofield")
