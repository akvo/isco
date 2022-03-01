"""create skip_logic table

Revision ID: 20b0db3d2f81
Revises: 2d95d4d571fa
Create Date: 2022-03-01 12:34:57.057118

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20b0db3d2f81'
down_revision = '2d95d4d571fa'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'skip_logic',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question', sa.Integer(),
                  sa.ForeignKey('question.id')),
        sa.Column('dependent_to', sa.Integer(),
                  sa.ForeignKey('question.id')),
        sa.Column('operator',
                  sa.Enum('==', '!=', '>',
                          '<', '>=', '<=',
                          name='skip_logic_operator')),
        sa.Column('value', sa.String()),
        sa.Column('type', sa.String()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['question'], ['question.id'],
                                name='question_skip_logic_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['dependent_to'], ['question.id'],
                                name='question_dependent_to_constraint')
    )
    op.create_index(op.f('ix_skip_logic_id'), 'skip_logic',
                    ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_skip_logic_id'), table_name='skip_logic')
    op.drop_table('skip_logic')
    op.execute('DROP TYPE skip_logic_operator')
