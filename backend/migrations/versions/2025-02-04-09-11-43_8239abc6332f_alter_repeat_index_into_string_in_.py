"""alter repeat_index into string in answer table

Revision ID: 8239abc6332f
Revises: ef9c3981ed9f
Create Date: 2025-02-04 09:11:43.728139

"""

from alembic import op
from alembic_utils.pg_view import PGView


# revision identifiers, used by Alembic.
revision = "8239abc6332f"
down_revision = "ef9c3981ed9f"
branch_labels = None
depends_on = None


sql_file_suffix = "_alter_summary_view_add_organisation_id_column.sql"
sql_file = open(f"./migrations/sql/2227d40f46d8{sql_file_suffix}", "r")
sql_string = sql_file.read()
summary_view = PGView(
    schema="public", signature="summary_view", definition=sql_string
)


def upgrade():
    # Step 1: Drop the view to allow column changes
    op.execute("DROP VIEW IF EXISTS summary_view;")

    # Step 2: Convert repeat_index from Integer to String (Text)
    op.execute(
        """
            ALTER TABLE answer ALTER COLUMN repeat_index
            TYPE TEXT USING repeat_index::TEXT;
        """
    )

    # Step 3: Recreate the view
    op.create_entity(summary_view)


def downgrade():
    # Step 1: Drop the view to allow column changes
    op.execute("DROP VIEW IF EXISTS summary_view;")

    # Step 2: Convert repeat_index from String back to Integer
    op.execute(
        """
            ALTER TABLE answer ALTER COLUMN repeat_index
            TYPE INTEGER USING repeat_index::INTEGER;
        """
    )

    # Step 3: Recreate the view
    op.create_entity(summary_view)
