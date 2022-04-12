"""create organisation member table

Revision ID: 62b3330bea3e
Revises: b4d1653bab9f
Create Date: 2022-04-12 11:03:15.827390

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '62b3330bea3e'
down_revision = 'b4d1653bab9f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'organisation_member',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('member_type', sa.Integer(),
                  sa.ForeignKey('member_type.id')),
        sa.Column('organisation', sa.Integer(),
                  sa.ForeignKey('organisation.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('member_type', 'organisation'),
        sa.ForeignKeyConstraint(['member_type'], ['member_type.id'],
                                name='member_type_organisation_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organisation'], ['organisation.id'],
                                name='organisation_member_type_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_organisation_member_id'),
                    'organisation_member', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_organisation_member_id'),
                  table_name='organisation_member')
    op.drop_table('organisation_member')
