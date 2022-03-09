"""create organisation isco table

Revision ID: 19eb27cadfc9
Revises: 109555d61c0f
Create Date: 2022-03-09 00:53:32.829891

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '19eb27cadfc9'
down_revision = '109555d61c0f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'organisation_isco',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('isco_type', sa.Integer(),
                  sa.ForeignKey('isco_type.id')),
        sa.Column('organisation', sa.Integer(),
                  sa.ForeignKey('organisation.id')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('isco_type', 'organisation'),
        sa.ForeignKeyConstraint(['isco_type'], ['isco_type.id'],
                                name='isco_type_organisation_constraint',
                                ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organisation'], ['organisation.id'],
                                name='organisation_isco_type_constraint',
                                ondelete='CASCADE')
    )
    op.create_index(op.f('ix_organisation_isco_id'),
                    'organisation_isco', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_organisation_isco_id'),
                  table_name='organisation_isco')
    op.drop_table('organisation_isco')
