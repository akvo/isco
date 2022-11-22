"""create roadmap template table

Revision ID: 7fb4692a7b18
Revises: a7f0e4fa8360
Create Date: 2022-11-22 08:17:37.066828

"""
from alembic import op
from sqlalchemy.sql import expression
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7fb4692a7b18'
down_revision = 'a7f0e4fa8360'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'roadmap_template',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column(
            'organisation', sa.Integer(), sa.ForeignKey('organisation.id')),
        sa.Column(
            'question', sa.BigInteger(), sa.ForeignKey('roadmap_question.id')),
        sa.Column(
            'mandatory', sa.Boolean(),
            server_default=expression.false(), nullable=False),
        sa.ForeignKeyConstraint(
            ['organisation'], ['organisation.id'],
            name='roadmap_template_organisation_constraint',
            ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['question'], ['question.id'],
            name='roadmap_template_question_constraint',
            ondelete='CASCADE')
    )
    op.create_index(op.f('ix_roadmap_template_id'),
                    'roadmap_template', ['id'], unique=True)


def downgrade():
    op.drop_index(
        op.f('ix_roadmap_template_id'), table_name='roadmap_template')
    op.drop_table('roadmap_template')
