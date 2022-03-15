"""add description column to form table

Revision ID: 65109b69be68
Revises: 9be20bc17ea8
Create Date: 2022-03-15 00:02:49.517920

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '65109b69be68'
down_revision = '9be20bc17ea8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'form',
        sa.Column('description', sa.Text())
    )


def downgrade():
    op.drop_column('form', 'description')
