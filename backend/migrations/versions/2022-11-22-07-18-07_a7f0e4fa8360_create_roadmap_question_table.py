"""create roadmap question table

Revision ID: a7f0e4fa8360
Revises: e815f0a4c70f
Create Date: 2022-11-22 07:18:07.262016

"""
from alembic import op
from sqlalchemy.sql import expression
from db.util import CastingArray
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = 'a7f0e4fa8360'
down_revision = 'e815f0a4c70f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'roadmap_question',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column(
            'question_group', sa.BigInteger(),
            sa.ForeignKey('roadmap_question_group.id')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('order', sa.Integer(), default=None),
        sa.Column('columns', CastingArray(pg.JSONB()), nullable=True),
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True),
        sa.Column('dependency', CastingArray(pg.JSONB()), nullable=True),
        sa.Column(
            'mandatory', sa.Boolean(),
            server_default=expression.false(), nullable=False),
        sa.Column(
            'datapoint_name', sa.Boolean(),
            server_default=expression.false(), nullable=False),
        sa.Column('variable_name', sa.String(), nullable=True, unique=True),
        sa.Column(
            'type',
            sa.Enum(
                'number', 'option', 'multiple_option', 'date', 'nested_list',
                'cascade', 'input', 'text', 'table',
                name='roadmap_question_type')),
        sa.Column(
            'personal_data', sa.Boolean(),
            server_default=expression.false(), nullable=False),
        sa.Column('rule', pg.JSONB(), nullable=True),
        sa.Column('tooltip', sa.String(), nullable=True),
        sa.Column(
            'tooltip_translations', CastingArray(pg.JSONB()), nullable=True),
        sa.Column(
            'repeating_objects', CastingArray(pg.JSONB()), nullable=True),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.Column(
            'cascade', sa.Integer(),
            sa.ForeignKey('cascade.id'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(
            ['question_group'], ['roadmap_question_group.id'],
            name='roadmap_question_group_question_constraint',
            ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['cascade'], ['cascade.id'],
            name='roadmap_question_cascade_constraint',
            ondelete='CASCADE')
    )
    op.create_index(op.f('ix_roadmap_question_id'),
                    'roadmap_question', ['id'], unique=True)


def downgrade():
    op.drop_index(
        op.f('ix_roadmap_question_id'), table_name='roadmap_question')
    op.drop_table('roadmap_question')
    op.execute('DROP TYPE roadmap_question_type')
