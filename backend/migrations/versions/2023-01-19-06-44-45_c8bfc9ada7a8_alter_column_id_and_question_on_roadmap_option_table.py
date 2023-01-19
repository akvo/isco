"""alter column id and question on roadmap option table

Revision ID: c8bfc9ada7a8
Revises: b57ad15b5508
Create Date: 2023-01-19 06:44:45.928008

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'c8bfc9ada7a8'
down_revision = 'b57ad15b5508'
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        '''
        ALTER TABLE roadmap_option ALTER COLUMN id
        TYPE BIGINT USING id::bigint
    ''')
    op.execute(
        '''
        ALTER TABLE roadmap_option ALTER COLUMN question
        TYPE BIGINT USING question::bigint
    ''')


def downgrade():
    op.execute(
        '''
        ALTER TABLE roadmap_option ALTER COLUMN id
        TYPE BIGINT USING id::bigint
    ''')
    op.execute(
        '''
        ALTER TABLE roadmap_option ALTER COLUMN question
        TYPE BIGINT USING question::bigint
    ''')
