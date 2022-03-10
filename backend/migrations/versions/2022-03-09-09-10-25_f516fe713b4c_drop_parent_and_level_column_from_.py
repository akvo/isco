"""drop parent and level column from organisation table

Revision ID: f516fe713b4c
Revises: 8db52f2f6acb
Create Date: 2022-03-09 09:10:25.894901

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f516fe713b4c'
down_revision = '8db52f2f6acb'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint('organisation_parent_fkey',
                       'organisation', type_='foreignkey')
    op.drop_column('organisation', 'parent')
    op.drop_column('organisation', 'level')


def downgrade():
    op.add_column(
        'organisation',
        sa.Column('parent', sa.Integer(), nullable=True)
    )
    op.add_column(
        'organisation',
        sa.Column('level', sa.Integer(), default=0)
    )
    op.create_foreign_key(None, 'organisation', 'organisation',
                          ['parent'], ['id'])
