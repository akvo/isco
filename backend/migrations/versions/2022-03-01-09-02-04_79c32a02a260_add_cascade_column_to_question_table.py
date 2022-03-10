"""add cascade column to question table

Revision ID: 2d95d4d571fa
Revises: 12d2a22a983e
Create Date: 2022-03-01 09:02:04.979732

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2d95d4d571fa'
down_revision = '12d2a22a983e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'question',
        sa.Column('cascade', sa.Integer(),
                  sa.ForeignKey('cascade.id'), nullable=True),
    )
    op.create_foreign_key(
        'question_cascade_constraint', 'question',
        'cascade', ['cascade'], ['id']
    )


def downgrade():
    op.drop_constraint('question_cascade_constraint',
                       'question', type_='foreignkey')
    op.drop_column('question', 'cascade')
