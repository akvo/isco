"""alter question type to follow akvo-react-form question type

Revision ID: 109555d61c0f
Revises: 5400bc2b20f7
Create Date: 2022-03-08 11:59:14.450565

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '109555d61c0f'
down_revision = '5400bc2b20f7'
branch_labels = None
depends_on = None


old_enum = ('text', 'number', 'single_select', 'multiple_select',
            'date', 'nested_list', 'cascade')
new_enum = ('text', 'number', 'option', 'multiple_option',
            'date', 'nested_list', 'cascade', 'input')


def upgrade():
    # alter question type with new value
    op.execute("ALTER TYPE question_type RENAME TO question_type_old")
    op.execute(f"CREATE TYPE question_type AS ENUM{new_enum}")
    op.execute((
        "ALTER TABLE question ALTER COLUMN type TYPE question_type USING "
        "type::text::question_type"
    ))
    op.execute("DROP TYPE question_type_old")


def downgrade():
    # alter question type with old value
    op.execute("ALTER TYPE question_type RENAME TO question_type_old")
    op.execute(f"CREATE TYPE question_type AS ENUM{old_enum}")
    op.execute((
        "ALTER TABLE question ALTER COLUMN type TYPE question_type USING "
        "type::text::question_type"
    ))
    op.execute("DROP TYPE question_type_old")
