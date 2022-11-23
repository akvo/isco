"""create roadmap data table

Revision ID: 8b62ec362a2a
Revises: 3be5776fdaac
Create Date: 2022-11-22 09:19:17.103984

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8b62ec362a2a'
down_revision = '3be5776fdaac'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'roadmap_data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column(
            'organisation', sa.Integer(), sa.ForeignKey('organisation.id')),
        sa.Column('reporting_year', sa.Integer(), nullable=True),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column(
            'created', sa.DateTime(),
            nullable=True, server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column(
            'updated', sa.DateTime(),
            nullable=True, onupdate=sa.text('(CURRENT_TIMESTAMP)')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['organisation'], ['organisation.id'],
                                name='roadmap_data_organisation_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'],
                                name='created_by_roadmap_data_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_roadmap_data_id'),
                    'roadmap_data', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_roadmap_data_id'), table_name='roadmap_data')
    op.drop_table('roadmap_data')
