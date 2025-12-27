"""add_display_order_to_expenses

Revision ID: a5d6f2d55300
Revises: 6c2b8e6f3f2a
Create Date: 2025-01-27

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a5d6f2d55300"
down_revision: Union[str, Sequence[str], None] = "6c2b8e6f3f2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("expenses", sa.Column("display_order", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_expenses_display_order"), "expenses", ["display_order"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_expenses_display_order"), table_name="expenses")
    op.drop_column("expenses", "display_order")

