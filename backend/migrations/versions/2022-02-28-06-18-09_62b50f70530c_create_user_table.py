"""create user table

Revision ID: 62b50f70530c
Revises: 1a02fad21885
Create Date: 2022-02-28 06:18:09.918210

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '62b50f70530c'
down_revision = '1a02fad21885'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organisation', sa.Integer(),
                  sa.ForeignKey('organisation.id')),
        sa.Column('name', sa.String()),
        sa.Column('email', sa.String(length=254)),
        sa.Column('phone_number', sa.String(), nullable=True),
        sa.Column('password', sa.String()),
        sa.Column('email_verified', sa.DateTime(), nullable=True),
        sa.Column('role', sa.Enum('secretariat_admin', 'member_admin',
                                  'member_user', name='userrole')),
        sa.Column('last_activity', sa.DateTime(), nullable=True),
        sa.Column('created', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['organisation'], ['organisation.id'],
                                name='organisation_user_constraint'))
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_index(op.f('ix_user_id'), 'user', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_user_id'), table_name='user')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')
    op.execute('DROP TYPE userrole')
