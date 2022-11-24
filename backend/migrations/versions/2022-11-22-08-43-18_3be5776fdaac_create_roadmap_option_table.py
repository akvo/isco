"""create roadmap option table

Revision ID: 3be5776fdaac
Revises: a7f0e4fa8360
Create Date: 2022-11-22 08:43:18.770457

"""
from alembic import op
from db.util import CastingArray
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = '3be5776fdaac'
down_revision = 'a7f0e4fa8360'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'roadmap_option',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String, nullable=True),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('order', sa.Integer(), default=None),
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True),
        sa.Column(
            'question', sa.Integer(), sa.ForeignKey('roadmap_question.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['question'], ['roadmap_question.id'],
                                name='roadmap_question_option_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_roadmap_option_id'),
                    'roadmap_option', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_roadmap_option_id'), table_name='roadmap_option')
    op.drop_table('roadmap_option')
