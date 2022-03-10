"""add order column to question group table

Revision ID: 1188c67467ca
Revises: 19eb27cadfc9
Create Date: 2022-03-09 05:26:20.313003

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1188c67467ca'
down_revision = '19eb27cadfc9'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'question_group',
        sa.Column('order', sa.Integer(), default=None)
    )


def downgrade():
    op.drop_column('question_group', 'order')
