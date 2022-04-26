"""add approved column into user table

Revision ID: 4b88964f4f96
Revises: 580284bd73ac
Create Date: 2022-04-22 07:18:25.025164

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4b88964f4f96'
down_revision = '580284bd73ac'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'user',
        sa.Column('approved', sa.Boolean(), nullable=True)
    )
    op.execute('UPDATE public."user" set approved = true')
    op.alter_column('user', 'approved', nullable=False)


def downgrade():
    op.drop_column('user', 'approved')
