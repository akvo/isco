"""create option table

Revision ID: f9218b903e1e
Revises: 499fcb78b9ab
Create Date: 2022-03-01 01:45:29.039849

"""
from alembic import op
from db.util import CastingArray
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = 'f9218b903e1e'
down_revision = '499fcb78b9ab'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'option',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String, nullable=True),
        sa.Column('name', sa.String),
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True),
        sa.Column('question', sa.Integer(), sa.ForeignKey('question.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['question'], ['question.id'],
                                name='question_option_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_option_id'), 'option', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_option_id'), table_name='option')
    op.drop_table('option')
