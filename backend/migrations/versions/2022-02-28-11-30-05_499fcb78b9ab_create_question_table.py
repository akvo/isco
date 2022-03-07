"""create question table

Revision ID: 499fcb78b9ab
Revises: a39b165c84d4
Create Date: 2022-02-28 11:30:05.268182

"""
from alembic import op
from sqlalchemy.sql import expression
from db.util import CastingArray
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = '499fcb78b9ab'
down_revision = 'a39b165c84d4'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('form', sa.Integer(), sa.ForeignKey('form.id')),
        sa.Column('question_group', sa.Integer(),
                  sa.ForeignKey('question_group.id')),
        sa.Column('name', sa.String()),
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True),
        sa.Column('mandatory', sa.Boolean,
                  server_default=expression.true(), nullable=False),
        sa.Column('datapoint_name', sa.Boolean,
                  server_default=expression.false(), nullable=False),
        sa.Column('variable_name', sa.String(), nullable=True, unique=True),
        sa.Column('type',
                  sa.Enum(
                      'text',
                      'number',
                      'single_select',
                      'multiple_select',
                      'date',
                      'nested_list',
                      'cascade',
                      name='question_type')),
        sa.Column('member_type', pg.ARRAY(sa.String())),
        sa.Column('isco_type', pg.ARRAY(sa.String())),
        sa.Column('personal_data', sa.Boolean,
                  server_default=expression.false(), nullable=False),
        sa.Column('rule', pg.JSONB(), nullable=True),
        sa.Column('tooltip', sa.String(), nullable=True),
        sa.Column('tooltip_translations',
                  CastingArray(pg.JSONB()), nullable=True),
        sa.Column('repeating_objects', CastingArray(pg.JSONB()),
                  nullable=True),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['form'], ['form.id'],
                                name='form_question_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_group'], ['question_group.id'],
                                name='question_group_question_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_question_id'),
                    'question', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_id'), table_name='question')
    op.drop_table('question')
    op.execute('DROP TYPE question_type')
