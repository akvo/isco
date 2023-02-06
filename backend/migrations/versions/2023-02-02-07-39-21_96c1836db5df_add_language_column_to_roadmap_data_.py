"""add_language_column_to_roadmap_data_table

Revision ID: 96c1836db5df
Revises: c8bfc9ada7a8
Create Date: 2023-02-02 07:39:21.542157

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '96c1836db5df'
down_revision = 'c8bfc9ada7a8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'roadmap_data',
        sa.Column('language', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('roadmap_data', 'language')
