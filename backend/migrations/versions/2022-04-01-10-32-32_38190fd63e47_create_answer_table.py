"""create answer table

Revision ID: 38190fd63e47
Revises: 2f4ae0c4c926
Create Date: 2022-04-01 10:32:32.303408

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = '38190fd63e47'
down_revision = '2f4ae0c4c926'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'answer',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question', sa.Integer(), sa.ForeignKey('question.id')),
        sa.Column('data', sa.Integer(), sa.ForeignKey('data.id')),
        sa.Column('value', sa.Float(), nullable=True),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column('options', pg.ARRAY(sa.String()), nullable=True),
        sa.Column('created',
                  sa.DateTime(),
                  nullable=True,
                  server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column('updated',
                  sa.DateTime(),
                  nullable=True,
                  onupdate=sa.text('(CURRENT_TIMESTAMP)')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['question'], ['question.id'],
                                name='question_answer_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['data'], ['data.id'],
                                name='data_answer_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_answer_id'), 'answer', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_answer_id'), table_name='answer')
    op.drop_table('answer')
