"""remove member_type from organisation table

Revision ID: b4d1653bab9f
Revises: d226f5976d3a
Create Date: 2022-04-12 10:57:36.816057

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b4d1653bab9f'
down_revision = 'd226f5976d3a'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(u'organisation_member_type_constraint',
                       'organisation', type_='foreignkey')
    op.drop_column('organisation', 'member_type')


def downgrade():
    op.add_column(
        'organisation',
        sa.Column('member_type', sa.Integer(),
                  sa.ForeignKey('member_type.id'))
    )
    op.create_foreign_key(u'organisation_member_type_constraint',
                          'organisation', 'member_type',
                          ['member_type'], ['id'])
