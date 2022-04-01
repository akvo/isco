"""add version column into form table

Revision ID: 3ba8d96dab3f
Revises: b3e76f54a19c
Create Date: 2022-04-01 02:26:57.920356

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3ba8d96dab3f'
down_revision = 'b3e76f54a19c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'form',
        sa.Column('version', sa.Float(),
                  nullable=True,
                  default=0.0),
    )
    op.add_column(
        'form',
        sa.Column('updated', sa.DateTime(),
                  nullable=True,
                  onupdate=sa.text('(CURRENT_TIMESTAMP)')),
    )


def downgrade():
    op.drop_column('form', 'version')
    op.drop_column('form', 'updated')
