"""add organisation column into data table

Revision ID: 939a78a53de1
Revises: 506af3af9f73
Create Date: 2022-04-07 08:41:51.487885

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '939a78a53de1'
down_revision = '506af3af9f73'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'data',
        sa.Column('organisation', sa.Integer(), nullable=False)
    )


def downgrade():
    op.drop_column('data', 'organisation')
