"""alter summary view add comment column

Revision ID: e6953923070b
Revises: 26dd75aab07d
Create Date: 2022-08-19 10:03:22.909738

"""
from alembic import op
from alembic_utils.pg_view import PGView


# revision identifiers, used by Alembic.
revision = 'e6953923070b'
down_revision = '26dd75aab07d'
branch_labels = None
depends_on = None

sql_file_suffix = '_alter_summary_view_add_comment_column.sql'
sql_file = open(f"./migrations/sql/{revision}{sql_file_suffix}", "r")
sql_string = sql_file.read()
summary_view = PGView(schema="public",
                      signature="summary_view",
                      definition=sql_string)

down_sql_file = open(f"./migrations/sql/{down_revision}_summary_view.sql", "r")
down_sql_string = down_sql_file.read()
down_summary_view = PGView(schema="public",
                           signature="summary_view",
                           definition=down_sql_string)


def upgrade():
    op.drop_entity(down_summary_view)
    op.create_entity(summary_view)


def downgrade():
    op.drop_entity(summary_view)
    op.create_entity(down_summary_view)
