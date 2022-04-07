"""add locked by column into data table

Revision ID: e9c5196cb37a
Revises: 939a78a53de1
Create Date: 2022-04-07 12:21:21.283558

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e9c5196cb37a'
down_revision = '939a78a53de1'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'data',
        sa.Column('locked_by', sa.Integer(), nullable=True)
    )


def downgrade():
    op.drop_column('data', 'locked_by')
