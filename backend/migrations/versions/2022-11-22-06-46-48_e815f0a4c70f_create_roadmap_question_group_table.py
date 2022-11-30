"""create roadmap question group table

Revision ID: e815f0a4c70f
Revises: e6953923070b
Create Date: 2022-11-22 06:46:48.553133

"""
from alembic import op
from sqlalchemy.sql import expression
from db.util import CastingArray
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = 'e815f0a4c70f'
down_revision = 'e6953923070b'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'roadmap_question_group',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('order', sa.Integer(), default=None),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column(
            'repeat', sa.Boolean(),
            server_default=expression.false(), nullable=False),
        sa.Column('repeat_text', sa.String(), nullable=True),
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roadmap_question_group_id'),
                    'roadmap_question_group', ['id'], unique=True)


def downgrade():
    op.drop_index(
        op.f('ix_roadmap_question_group_id'),
        table_name='roadmap_question_group')
    op.drop_table('roadmap_question_group')
