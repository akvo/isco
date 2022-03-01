"""create question_group_question table

Revision ID: 2d95d4d571fa
Revises: 12d2a22a983e
Create Date: 2022-03-01 06:35:22.783943

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2d95d4d571fa'
down_revision = '12d2a22a983e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question_group_question',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('form', sa.Integer(), sa.ForeignKey('form.id')),
        sa.Column(
            'question_group',
            sa.Integer(),
            sa.ForeignKey('question_group.id')),
        sa.Column('question', sa.Integer(), sa.ForeignKey('question.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(
            ['form'], ['form.id'],
            name='question_group_question_form_constraint'),
        sa.ForeignKeyConstraint(
            ['question_group'], ['question_group.id'],
            name='question_group_question_question_group_constraint'),
        sa.ForeignKeyConstraint(
            ['question'], ['question.id'],
            name='question_group_question_question_constraint')
    )
    op.create_index(op.f('ix_question_group_question_id'),
                    'question_group_question', ['id'],
                    unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_group_question_id'),
                  table_name='question_group_question')
    op.drop_table('question_group_question')
