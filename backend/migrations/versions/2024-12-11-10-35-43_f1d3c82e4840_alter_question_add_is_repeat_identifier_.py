"""alter question add is_repeat_identifier column

Revision ID: f1d3c82e4840
Revises: b58446bc3039
Create Date: 2024-12-11 10:35:43.422705

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f1d3c82e4840"
down_revision = "b58446bc3039"
branch_labels = None
depends_on = None


def upgrade():
    # Add the is_repeat_identifier column to the question table
    op.add_column(
        "question",
        sa.Column(
            "is_repeat_identifier",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade():
    # Remove the is_repeat_identifier column from the question table
    op.drop_column("question", "is_repeat_identifier")
