"""create reset password table

Revision ID: 580284bd73ac
Revises: 62b3330bea3e
Create Date: 2022-04-15 10:45:31.956457

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '580284bd73ac'
down_revision = '62b3330bea3e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'reset_password',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user', sa.Integer(), nullable=False),
        sa.Column('url', sa.String, nullable=False),
        sa.Column(
            'valid',
            sa.DateTime(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(['user'], ['user.id'],
                                name='user_reset_password_constraint',
                                ondelete='CASCADE'))
    op.create_index(op.f('ix_reset_password'), 'reset_password', ['id'])


def downgrade():
    op.drop_index(op.f('ix_reset_password'), table_name='user')
    op.drop_table('reset_password')
