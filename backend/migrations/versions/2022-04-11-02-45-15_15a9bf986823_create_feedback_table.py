"""create feedback table

Revision ID: 15a9bf986823
Revises: ec4d156fc68e
Create Date: 2022-04-11 02:45:15.890287

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '15a9bf986823'
down_revision = 'ec4d156fc68e'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user', sa.Integer(),
                  sa.ForeignKey('user.id')),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('created',
                  sa.DateTime(),
                  nullable=True,
                  server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user'], ['user.id'],
                                name='feedback_user_constraint',
                                ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_feedback_id'),
                    'collaborator', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_feedback_id'), table_name='feedback')
    op.drop_table('feedback')
