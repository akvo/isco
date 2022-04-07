"""add repeat_text column into question group table

Revision ID: c9113aa1d368
Revises: 38190fd63e47
Create Date: 2022-04-07 03:01:33.045218

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c9113aa1d368'
down_revision = '38190fd63e47'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'question_group',
        sa.Column('repeat_text', sa.String(), nullable=True)
    )


def downgrade():
    op.drop_column('question_group', 'repeat_text')
