"""create roadmap answer table

Revision ID: ed3ed204040b
Revises: 8b62ec362a2a
Create Date: 2022-11-22 09:19:25.776014

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = 'ed3ed204040b'
down_revision = '8b62ec362a2a'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'roadmap_answer',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column(
            'question', sa.BigInteger(), sa.ForeignKey('roadmap_question.id')),
        sa.Column('data', sa.Integer(), sa.ForeignKey('roadmap_data.id')),
        sa.Column('value', sa.Float(), nullable=True),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column('options', pg.ARRAY(sa.String()), nullable=True),
        sa.Column('repeat_index', sa.Integer(), nullable=True, default=0),
        sa.Column(
            'created', sa.DateTime(),
            nullable=True, server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column(
            'updated', sa.DateTime(),
            nullable=True, onupdate=sa.text('(CURRENT_TIMESTAMP)')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['question'], ['roadmap_question.id'],
                                name='roadmap_question_answer_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['data'], ['roadmap_data.id'],
                                name='roadmap_data_answer_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_roadmap_answer_id'),
                    'roadmap_answer', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_roadmap_answer_id'), table_name='roadmap_answer')
    op.drop_table('roadmap_answer')
