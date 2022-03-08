"""create question member access table

Revision ID: 323553519735
Revises: 200cbf16d47b
Create Date: 2022-03-08 02:29:28.725182

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '323553519735'
down_revision = '200cbf16d47b'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question_member_access',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question', sa.Integer(),
                  sa.ForeignKey('question.id')),
        sa.Column('member_type', sa.Integer(),
                  sa.ForeignKey('member_type.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('question', 'member_type'),
        sa.ForeignKeyConstraint(['question'], ['question.id'],
                                name='question_member_access_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['member_type'], ['member_type.id'],
                                name='member_type_member_access_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_question_member_access_id'),
                    'question_member_access', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_member_access_id'),
                  table_name='question_member_access')
    op.drop_table('question_member_access')
