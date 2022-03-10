"""add member_type column to organisation table

Revision ID: 9be20bc17ea8
Revises: f516fe713b4c
Create Date: 2022-03-09 09:35:22.887946

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9be20bc17ea8'
down_revision = 'f516fe713b4c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'organisation',
        sa.Column('member_type', sa.Integer(),
                  sa.ForeignKey('member_type.id'))
    )
    op.create_foreign_key(u'organisation_member_type_constraint',
                          'organisation', 'member_type',
                          ['member_type'], ['id'])


def downgrade():
    op.drop_constraint(u'organisation_member_type_constraint',
                       'organisation', type_='foreignkey')
    op.drop_column('organisation', 'member_type')
