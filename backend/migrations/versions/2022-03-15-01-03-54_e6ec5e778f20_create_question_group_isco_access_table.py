"""create question group isco access table

Revision ID: e6ec5e778f20
Revises: f65280aa36ea
Create Date: 2022-03-15 01:03:54.347531

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e6ec5e778f20'
down_revision = 'f65280aa36ea'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question_group_isco_access',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_group', sa.Integer(),
                  sa.ForeignKey('question_group.id')),
        sa.Column('isco_type', sa.Integer(),
                  sa.ForeignKey('isco_type.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('question_group', 'isco_type'),
        sa.ForeignKeyConstraint(['question_group'], ['question_group.id'],
                                name='question_group_isco_access_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['isco_type'], ['isco_type.id'],
                                name='qg_isco_type_isco_access_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_question_group_isco_access_id'),
                    'question_group_isco_access', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_group_isco_access_id'),
                  table_name='question_group_isco_access')
    op.drop_table('question_group_isco_access')
