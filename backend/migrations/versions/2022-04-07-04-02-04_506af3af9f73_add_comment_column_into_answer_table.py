"""add comment column into answer table

Revision ID: 506af3af9f73
Revises: c9113aa1d368
Create Date: 2022-04-07 04:02:04.824731

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '506af3af9f73'
down_revision = 'c9113aa1d368'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'answer',
        sa.Column('comment', sa.Text(), nullable=True)
    )


def downgrade():
    op.drop_column('answer', 'comment')
