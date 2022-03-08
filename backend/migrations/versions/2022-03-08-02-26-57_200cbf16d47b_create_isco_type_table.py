"""create isco type table

Revision ID: 200cbf16d47b
Revises: d48a51096f80
Create Date: 2022-03-08 02:26:57.228618

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '200cbf16d47b'
down_revision = 'd48a51096f80'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'isco_type',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('isco_type_id'),
                    'isco_type', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('isco_type_id'), table_name='isco_type')
    op.drop_table('isco_type')
