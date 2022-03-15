"""add description column to question group table

Revision ID: 617e7fc228e7
Revises: 65109b69be68
Create Date: 2022-03-15 00:19:09.767276

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '617e7fc228e7'
down_revision = '65109b69be68'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'question_group',
        sa.Column('description', sa.Text())
    )


def downgrade():
    op.drop_column('question_group', 'description')
