"""create question group member access table

Revision ID: f65280aa36ea
Revises: 617e7fc228e7
Create Date: 2022-03-15 01:03:48.622049

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f65280aa36ea'
down_revision = '617e7fc228e7'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question_group_member_access',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_group', sa.Integer(),
                  sa.ForeignKey('question_group.id')),
        sa.Column('member_type', sa.Integer(),
                  sa.ForeignKey('member_type.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('question_group', 'member_type'),
        sa.ForeignKeyConstraint(['question_group'], ['question_group.id'],
                                name='question_group_member_access_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['member_type'], ['member_type.id'],
                                name='qg_member_type_member_access_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_question_group_member_access_id'),
                    'question_group_member_access', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_group_member_access_id'),
                  table_name='question_group_member_access')
    op.drop_table('question_group_member_access')
