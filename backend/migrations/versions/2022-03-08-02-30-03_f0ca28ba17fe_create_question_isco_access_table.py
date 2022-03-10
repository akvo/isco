"""create question isco access table

Revision ID: f0ca28ba17fe
Revises: 323553519735
Create Date: 2022-03-08 02:30:03.176986

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f0ca28ba17fe'
down_revision = '323553519735'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question_isco_access',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question', sa.Integer(),
                  sa.ForeignKey('question.id')),
        sa.Column('isco_type', sa.Integer(),
                  sa.ForeignKey('isco_type.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('question', 'isco_type'),
        sa.ForeignKeyConstraint(['question'], ['question.id'],
                                name='question_isco_access_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['isco_type'], ['isco_type.id'],
                                name='isco_type_isco_access_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_question_isco_access_id'),
                    'question_isco_access', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_isco_access_id'),
                  table_name='question_isco_access')
    op.drop_table('question_isco_access')
