"""create collaborator table

Revision ID: de733b0d7984
Revises: e9c5196cb37a
Create Date: 2022-04-09 05:44:20.025652

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'de733b0d7984'
down_revision = 'e9c5196cb37a'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'collaborator',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('data', sa.Integer(),
                  sa.ForeignKey('data.id')),
        sa.Column('organisation', sa.Integer(),
                  sa.ForeignKey('organisation.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['data'], ['data.id'],
                                name='collaborator_data_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organisation'], ['organisation.id'],
                                name='collaborator_organisation_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_collaborator_id'),
                    'collaborator', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_collaborator_id'), table_name='collaborator')
    op.drop_table('collaborator')
