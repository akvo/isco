"""create data table

Revision ID: 2f4ae0c4c926
Revises: 3ba8d96dab3f
Create Date: 2022-04-01 10:23:18.607562

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = '2f4ae0c4c926'
down_revision = '3ba8d96dab3f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('form', sa.Integer(), sa.ForeignKey('form.id')),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('geo', pg.ARRAY(sa.Float()), nullable=True),
        sa.Column('created',
                  sa.DateTime(),
                  nullable=True,
                  server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column('updated',
                  sa.DateTime(),
                  nullable=True,
                  onupdate=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column('submitted',
                  sa.DateTime(),
                  nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['form'], ['form.id'],
                                name='form_data_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_data_id'), 'data', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_data_id'), table_name='data')
    op.drop_table('data')
