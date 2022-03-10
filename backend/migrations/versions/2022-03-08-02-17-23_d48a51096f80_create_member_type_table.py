"""create member type table

Revision ID: d48a51096f80
Revises: 20b0db3d2f81
Create Date: 2022-03-08 02:17:23.833467

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd48a51096f80'
down_revision = '20b0db3d2f81'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'member_type',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_member_type_id'),
                    'member_type', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_member_type_id'), table_name='member_type')
    op.drop_table('member_type')
