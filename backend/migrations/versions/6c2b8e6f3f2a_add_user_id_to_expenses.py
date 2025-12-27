"""add_user_id_to_expenses

Revision ID: 6c2b8e6f3f2a
Revises: ffc19567268f
Create Date: 2025-12-27

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6c2b8e6f3f2a"
down_revision: Union[str, Sequence[str], None] = "ffc19567268f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("expenses", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_expenses_user_id_users",
        "expenses",
        "users",
        ["user_id"],
        ["id"],
    )
    op.create_index(op.f("ix_expenses_user_id"), "expenses", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_expenses_user_id"), table_name="expenses")
    op.drop_constraint("fk_expenses_user_id_users", "expenses", type_="foreignkey")
    op.drop_column("expenses", "user_id")


