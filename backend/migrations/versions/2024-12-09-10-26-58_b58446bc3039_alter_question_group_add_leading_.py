"""alter question group add leading question relation

Revision ID: b58446bc3039
Revises: 2227d40f46d8
Create Date: 2024-12-09 10:26:58.492018

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "b58446bc3039"
down_revision = "2227d40f46d8"
branch_labels = None
depends_on = None


def upgrade():
    # Add leading_question_id column to question_group table
    op.add_column(
        "question_group",
        sa.Column("leading_question_id", sa.Integer, nullable=True),
    )
    # Create a foreign key constraint for leading_question_id
    op.create_foreign_key(
        "fk_question_group_leading_question_id",
        "question_group",
        "question",
        ["leading_question_id"],
        ["id"],
    )


def downgrade():
    # Drop the foreign key constraint
    op.drop_constraint(
        "fk_question_group_leading_question_id",
        "question_group",
        type_="foreignkey",
    )
    # Remove the leading_question_id column from question_group table
    op.drop_column("question_group", "leading_question_id")
