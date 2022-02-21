"""create user table

Revision ID: 08a12a005fd4
Revises: 4710db611d8e
Create Date: 2022-02-21 03:47:41.438899

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '08a12a005fd4'
down_revision = '4710db611d8e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user', sa.Column('id', sa.Integer()),
        sa.Column('organisation', sa.Integer(),
                  sa.ForeignKey('organisation.id')),
        sa.Column('name', sa.String()),
        sa.Column('email', sa.String(length=254)),
        sa.Column('phone_number', sa.String(), nullable=True),
        sa.Column('password', sa.String()),
        sa.Column('active', sa.Boolean(), default=False),
        sa.Column('role', sa.Enum('secretariat_admin', 'member_admin',
                                  'member_user', name='userrole')),
        sa.Column('last_activity', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['organisation'], ['organisation.id'],
                                name='organisation_user_constraint',
                                ondelete='CASCADE'))
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_index(op.f('ix_user_id'), 'user', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_user_id'), table_name='user')
    op.drop_table('user')
    op.execute('DROP TYPE userrole')
