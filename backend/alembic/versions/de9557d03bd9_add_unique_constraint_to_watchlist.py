"""add unique constraint to watchlist

Revision ID: de9557d03bd9
Revises: 2bfba3bd0706
Create Date: 2025-11-22 16:55:48.455313

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "de9557d03bd9"
down_revision: Union[str, None] = "2bfba3bd0706"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(
        "uq_user_asset", "watchlist_items", ["user_id", "asset_id"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_user_asset", "watchlist_items")
