"""add autofield column to question table

Revision ID: 0caa3e1da199
Revises: 74250a003510
Create Date: 2024-01-18 06:24:17.376001

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


# revision identifiers, used by Alembic.
revision = "0caa3e1da199"
down_revision = "74250a003510"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "question",
        sa.Column("autofield", pg.JSONB(), default=None, nullable=True),
    )

    # Create a new enum type for autofield
    op.execute(
        """
        CREATE TYPE question_type_new AS
        ENUM (
            'input',
            'text',
            'number',
            'option',
            'multiple_option',
            'date',
            'nested_list',
            'cascade',
            'autofield'
        )
        """
    )

    # Alter the column to use the new enum type
    op.execute(
        """
        ALTER TABLE question ALTER COLUMN type TYPE question_type_new
        USING type::text::question_type_new
        """
    )

    # Drop the old enum type
    op.execute("DROP TYPE question_type")

    # Rename the new enum type to the original name
    op.execute("ALTER TYPE question_type_new RENAME TO question_type")


def downgrade():
    # Update question with autofield into input question type
    op.execute("UPDATE question SET type = 'input' WHERE type = 'autofield'")

    # Create a new enum type for autofield
    op.execute(
        """
        CREATE TYPE question_type_new AS
        ENUM (
            'input',
            'text',
            'number',
            'option',
            'multiple_option',
            'date',
            'nested_list',
            'cascade'
        )
        """
    )

    # Alter the column to use the new enum type
    op.execute(
        """
        ALTER TABLE question ALTER COLUMN type TYPE question_type_new
        USING type::text::question_type_new
        """
    )

    # Drop the old enum type
    op.execute("DROP TYPE question_type")

    # Rename the new enum type to the original name
    op.execute("ALTER TYPE question_type_new RENAME TO question_type")

    # Drop the autofield column
    op.drop_column("question", "autofield")
