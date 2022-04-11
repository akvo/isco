"""add invitation to user table

Revision ID: ec4d156fc68e
Revises: de733b0d7984
Create Date: 2022-04-10 21:45:13.205828

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ec4d156fc68e'
down_revision = 'de733b0d7984'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'user',
        sa.Column('invitation', sa.Text(), default=None, nullable=True)
    )


def downgrade():
    op.drop_column('user', 'invitation')
