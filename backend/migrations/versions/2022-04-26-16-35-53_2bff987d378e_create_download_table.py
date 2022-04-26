"""create download table

Revision ID: 2bff987d378e
Revises: 4b88964f4f96
Create Date: 2022-04-26 16:35:53.372294

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg

# revision identifiers, used by Alembic.
revision = '2bff987d378e'
down_revision = '4b88964f4f96'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'download', sa.Column('id', sa.Integer(), nullable=False),
        sa.Column(
            'uuid',
            pg.UUID(as_uuid=True),
            nullable=True,
            server_default=sa.text(
                '(md5(random()::text || clock_timestamp()::text)::uuid)')),
        sa.Column('form', sa.Integer(), sa.ForeignKey('form.id')),
        sa.Column('data', sa.Integer(), sa.ForeignKey('data.id')),
        sa.Column('file', sa.String(), nullable=False),
        sa.Column('request_by', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('created',
                  sa.DateTime(),
                  nullable=True,
                  server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column('expired',
                  sa.DateTime(),
                  nullable=True,
                  onupdate=sa.text('(CURRENT_TIMESTAMP)')),
        sa.ForeignKeyConstraint(['form'], ['form.id'],
                                name='form_download_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['data'], ['data.id'],
                                name='data_download_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['request_by'], ['user.id'],
                                name='request_by_download_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['approved_by'], ['user.id'],
                                name='approved_by_download_constraint',
                                ondelete='CASCADE'))
    op.create_index(op.f('ix_download_id'), 'download', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_download_id'), table_name='download')
    op.drop_table('download')
