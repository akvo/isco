"""alter question group add show_repeat_in_question_level column

Revision ID: ef9c3981ed9f
Revises: 1471ff286611
Create Date: 2024-12-23 06:57:42.541518

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "ef9c3981ed9f"
down_revision = "1471ff286611"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "question_group",
        sa.Column(
            "show_repeat_in_question_level",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )


def downgrade():
    op.drop_column("question_group", "show_repeat_in_question_level")
