"""add core mandatory column to question table

Revision ID: 05d5e6b6895e
Revises: ed3ed204040b
Create Date: 2023-01-10 03:01:23.145990

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import expression


# revision identifiers, used by Alembic.
revision = '05d5e6b6895e'
down_revision = 'ed3ed204040b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'question',
        sa.Column(
            'core_mandatory', sa.Boolean(),
            server_default=expression.false(),
            nullable=False))


def downgrade():
    op.drop_column('question', 'core_mandatory')
