"""create cascade_list table

Revision ID: 12d2a22a983e
Revises: c15a621f1b39
Create Date: 2022-03-01 03:04:09.495555

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '12d2a22a983e'
down_revision = 'c15a621f1b39'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'cascade_list',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cascade', sa.Integer(), sa.ForeignKey('cascade.id')),
        sa.Column('parent', sa.Integer(), nullable=True),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('name', sa.String()),
        sa.Column('path', sa.String(), nullable=True),
        sa.Column('level', sa.Integer()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['cascade'], ['cascade.id'],
                                name='cascade_cascade_list_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_cascade_list_id'), 'cascade_list',
                    ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_cascade_list_id'), table_name='cascade_list')
    op.drop_table('cascade_list')
