"""add questionnaires column into user table

Revision ID: d226f5976d3a
Revises: 15a9bf986823
Create Date: 2022-04-12 07:02:58.757456

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

# revision identifiers, used by Alembic.
revision = 'd226f5976d3a'
down_revision = '15a9bf986823'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'user',
        sa.Column('questionnaires', pg.ARRAY(sa.Integer()),
                  default=None, nullable=True)
    )


def downgrade():
    op.drop_column('user', 'questionnaires')
