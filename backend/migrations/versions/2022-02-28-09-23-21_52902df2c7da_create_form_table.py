"""create form table

Revision ID: 52902df2c7da
Revises: 62b50f70530c
Create Date: 2022-02-28 09:23:21.539057

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = '52902df2c7da'
down_revision = '62b50f70530c'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'form',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String()),
        sa.Column('languages', pg.ARRAY(sa.String()), nullable=True),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'))
    op.create_index(op.f('ix_form_id'), 'form', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_form_id'), table_name='form')
    op.drop_table('form')
