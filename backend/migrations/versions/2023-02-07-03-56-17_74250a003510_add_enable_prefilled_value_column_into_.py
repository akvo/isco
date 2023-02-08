"""add enable prefilled value column into form table

Revision ID: 74250a003510
Revises: 96c1836db5df
Create Date: 2023-02-07 03:56:17.508364

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import expression


# revision identifiers, used by Alembic.
revision = '74250a003510'
down_revision = '96c1836db5df'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'form',
        sa.Column(
            'enable_prefilled_value', sa.Boolean(),
            server_default=expression.false(),
            nullable=False))


def downgrade():
    op.drop_column('form', 'enable_prefilled_value')
