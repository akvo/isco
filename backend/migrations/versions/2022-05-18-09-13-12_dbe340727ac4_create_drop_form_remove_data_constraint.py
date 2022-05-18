"""create drop form remove data constraint

Revision ID: dbe340727ac4
Revises: 2bff987d378e
Create Date: 2022-05-18 09:13:12.635413

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'dbe340727ac4'
down_revision = '2bff987d378e'
branch_labels = None
depends_on = None


def upgrade():
    form_type = postgresql.ENUM('project', 'member', name='form_type')
    form_type.create(op.get_bind())
    op.drop_column('download', 'form')
    op.drop_constraint(u'download_data_fkey',
                       'download', type_='foreignkey')
    op.drop_constraint(u'data_download_constraint',
                       'download',
                       type_='foreignkey')
    op.add_column(
        'download',
        sa.Column('form_type',
                  sa.Enum('project', 'member', name='form_type'),
                  nullable=True))


def downgrade():
    op.drop_column('download', 'form_type')

    form_type = postgresql.ENUM('project', 'member', name='form_type')
    form_type.drop(op.get_bind())
