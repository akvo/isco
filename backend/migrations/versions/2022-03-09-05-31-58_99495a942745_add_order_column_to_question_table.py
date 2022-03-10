"""add order column to question table

Revision ID: 99495a942745
Revises: 1188c67467ca
Create Date: 2022-03-09 05:31:58.831439

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '99495a942745'
down_revision = '1188c67467ca'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'question',
        sa.Column('order', sa.Integer(), default=None)
    )


def downgrade():
    op.drop_column('question', 'order')
