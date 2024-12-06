"""alter summary view add organisation id column

Revision ID: 2227d40f46d8
Revises: 0caa3e1da199
Create Date: 2024-12-06 07:47:17.592119

"""

from alembic import op
from alembic_utils.pg_view import PGView


# revision identifiers, used by Alembic.
revision = "2227d40f46d8"
down_revision = "0caa3e1da199"
branch_labels = None
depends_on = None


sql_file_suffix = "_alter_summary_view_add_organisation_id_column.sql"
sql_file = open(f"./migrations/sql/{revision}{sql_file_suffix}", "r")
sql_string = sql_file.read()
summary_view = PGView(
    schema="public", signature="summary_view", definition=sql_string
)

down_sql_file_name = "e6953923070b_alter_summary_view_add_comment_column"
down_sql_file = open(f"./migrations/sql/{down_sql_file_name}.sql", "r")
down_sql_string = down_sql_file.read()
down_summary_view = PGView(
    schema="public", signature="summary_view", definition=down_sql_string
)


def upgrade():
    op.drop_entity(down_summary_view)
    op.create_entity(summary_view)


def downgrade():
    op.drop_entity(summary_view)
    op.create_entity(down_summary_view)
