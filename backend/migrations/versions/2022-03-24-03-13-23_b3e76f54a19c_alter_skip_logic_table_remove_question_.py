"""alter skip logic table remove question_dependent_to_constraint

Revision ID: b3e76f54a19c
Revises: e6ec5e778f20
Create Date: 2022-03-24 03:13:23.094991

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'b3e76f54a19c'
down_revision = 'e6ec5e778f20'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(u'question_dependent_to_constraint',
                       'skip_logic', type_='foreignkey')
    op.drop_constraint(u'skip_logic_dependent_to_fkey',
                       'skip_logic', type_='foreignkey')


def downgrade():
    op.create_foreign_key(u'skip_logic_dependent_to_fkey',
                          'skip_logic', 'question', ['question'], ['id'])
    op.create_foreign_key(u'question_dependent_to_constraint',
                          'skip_logic', 'question', ['dependent_to'], ['id'])
