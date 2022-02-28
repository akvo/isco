"""create question_group table

Revision ID: a39b165c84d4
Revises: 52902df2c7da
Create Date: 2022-02-28 09:32:59.287005

"""
from alembic import op
from sqlalchemy.sql import expression
from db.util import CastingArray, ArrayOfEnum
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = 'a39b165c84d4'
down_revision = '52902df2c7da'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question_group',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String()),
        sa.Column('translations', CastingArray(pg.JSONB()), nullable=True),
        sa.Column('member_type',
                  ArrayOfEnum(
                      sa.Enum('Big Industry', 'Small Industry',
                              'DISCO - Traders', 'Retail',
                              'Standard Setting Organisation'
                              'Other', name='member_type'))),
        sa.Column('isco_type',
                  ArrayOfEnum(sa.Enum('ISCO', name='isco_type'))),
        sa.Column('repeat', sa.Boolean,
                  server_default=expression.true(), nullable=False),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_question_group_id'),
                    'question_group', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_group_id'), table_name='question_group')
    op.drop_table('question_group')
    op.execute('DROP TYPE member_type')
    op.execute('DROP TYPE isco_type')
