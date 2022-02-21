"""create organisation table

Revision ID: 4710db611d8e
Revises:
Create Date: 2022-02-21 03:36:00.302719

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4710db611d8e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'organisation', sa.Column('id', sa.Integer()),
        sa.Column('parent', sa.Integer(), nullable=True),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('name', sa.String()),
        sa.Column('level', sa.Integer(), default=0),
        sa.Column('active', sa.Boolean(), default=True),
        sa.PrimaryKeyConstraint('id'))
    op.create_foreign_key(None, 'organisation', 'organisation',
                          ['parent'], ['id'])
    op.create_index(op.f('ix_organisation_id'),
                    'organisation', ['id'],
                    unique=True)


def downgrade():
    op.drop_table('organisation')
