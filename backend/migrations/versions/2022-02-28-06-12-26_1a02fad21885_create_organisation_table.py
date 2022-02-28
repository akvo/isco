"""create organisation table

Revision ID: 1a02fad21885
Revises: 08a12a005fd4
Create Date: 2022-02-28 06:12:26.939440

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1a02fad21885'
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
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'))
    op.create_foreign_key(None, 'organisation', 'organisation',
                          ['parent'], ['id'])
    op.create_index(op.f('ix_organisation_id'),
                    'organisation', ['id'],
                    unique=True)


def downgrade():
    op.drop_table('organisation')
