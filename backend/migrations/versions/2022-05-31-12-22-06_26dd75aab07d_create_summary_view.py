"""create_summary_view

Revision ID: 26dd75aab07d
Revises: dbe340727ac4
Create Date: 2022-05-31 12:22:06.872623

"""
from alembic import op
from alembic_utils.pg_view import PGView

# revision identifiers, used by Alembic.
revision = '26dd75aab07d'
down_revision = 'dbe340727ac4'
branch_labels = None
depends_on = None

sql_file = open(f"./migrations/sql/{revision}_summary_view.sql", "r")
sql_string = sql_file.read()
summary_view = PGView(schema="public",
                      signature="summary_view",
                      definition=sql_string)
sql_file.close()


def upgrade():
    op.create_entity(summary_view)


def downgrade():
    op.drop_entity(summary_view)
