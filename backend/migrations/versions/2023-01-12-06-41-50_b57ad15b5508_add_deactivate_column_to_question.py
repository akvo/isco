"""add_deactivate_column_to_question

Revision ID: b57ad15b5508
Revises: 05d5e6b6895e
Create Date: 2023-01-12 06:41:50.629378

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import expression


# revision identifiers, used by Alembic.
revision = 'b57ad15b5508'
down_revision = '05d5e6b6895e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'question',
        sa.Column(
            'deactivate', sa.Boolean(),
            server_default=expression.false(),
            nullable=False))


def downgrade():
    op.drop_column('question', 'deactivate')
