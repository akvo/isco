"""drop member type and isco type column from question table

Revision ID: 5400bc2b20f7
Revises: f0ca28ba17fe
Create Date: 2022-03-08 03:06:15.873715

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = '5400bc2b20f7'
down_revision = 'f0ca28ba17fe'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('question', 'member_type')
    op.drop_column('question', 'isco_type')


def downgrade():
    op.add_column(
        'question',
        sa.Column('member_type', pg.ARRAY(sa.String()))
    )
    op.add_column(
        'question',
        sa.Column('isco_type', pg.ARRAY(sa.String()))
    )
