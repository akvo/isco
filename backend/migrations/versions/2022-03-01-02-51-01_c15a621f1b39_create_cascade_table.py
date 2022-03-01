"""create cascade table

Revision ID: c15a621f1b39
Revises: f9218b903e1e
Create Date: 2022-03-01 02:51:01.873394

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c15a621f1b39'
down_revision = 'f9218b903e1e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'cascade',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cascade_id'), 'cascade', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_cascade_id'), table_name='cascade')
    op.drop_table('cascade')
