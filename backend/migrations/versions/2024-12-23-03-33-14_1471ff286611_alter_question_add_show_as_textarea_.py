"""alter question add show_as_textarea column

Revision ID: 1471ff286611
Revises: f1d3c82e4840
Create Date: 2024-12-23 03:33:14.500641

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "1471ff286611"
down_revision = "f1d3c82e4840"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "question",
        sa.Column(
            "show_as_textarea",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )


def downgrade():
    op.drop_column("question", "show_as_textarea")
