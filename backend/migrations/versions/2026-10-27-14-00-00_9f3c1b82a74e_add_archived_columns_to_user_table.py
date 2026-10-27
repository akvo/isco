"""add archived columns to user table

Revision ID: 9f3c1b82a74e
Revises: 8239abc6332f
Create Date: 2026-10-27 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9f3c1b82a74e'
down_revision = '8239abc6332f'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'user',
        sa.Column(
            'archived',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
        )
    )
    op.add_column(
        'user',
        sa.Column('last_status_changed_at', sa.DateTime(), nullable=True)
    )
    op.add_column(
        'user',
        sa.Column(
            'last_status_changed_by',
            sa.Integer(),
            sa.ForeignKey('user.id', ondelete='SET NULL'),
            nullable=True,
        )
    )


def downgrade():
    op.drop_column('user', 'last_status_changed_by')
    op.drop_column('user', 'last_status_changed_at')
    op.drop_column('user', 'archived')
