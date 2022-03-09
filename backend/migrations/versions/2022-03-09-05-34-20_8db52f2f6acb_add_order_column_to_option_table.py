"""add order column to option table

Revision ID: 8db52f2f6acb
Revises: 99495a942745
Create Date: 2022-03-09 05:34:20.817816

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8db52f2f6acb'
down_revision = '99495a942745'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'option',
        sa.Column('order', sa.Integer(), default=None)
    )


def downgrade():
    op.drop_column('option', 'order')
