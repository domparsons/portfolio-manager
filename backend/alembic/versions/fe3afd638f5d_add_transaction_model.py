"""Add Transaction model

Revision ID: fe3afd638f5d
Revises: 6209ddfd9811
Create Date: 2025-04-05 08:16:44.578637

"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "fe3afd638f5d"
down_revision: Union[str, None] = "6209ddfd9811"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("portfolio_name", sa.String(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.Enum("buy", "sell", name="transactiontype"), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.CheckConstraint("price >= 0", name="check_price_nonnegative"),
        sa.CheckConstraint("quantity > 0", name="check_quantity_positive"),
        sa.ForeignKeyConstraint(
            ["asset_id"],
            ["assets.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_transaction_user_portfolio", "transactions", ["user_id", "portfolio_name"], unique=False
    )
    op.create_index(op.f("ix_transactions_id"), "transactions", ["id"], unique=False)
    op.drop_index("ix_portfolio_asset_id", table_name="portfolio")
    op.drop_index("ix_portfolio_portfolio_name", table_name="portfolio")
    op.drop_index("ix_portfolio_user_id", table_name="portfolio")
    op.drop_table("portfolio")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "portfolio",
        sa.Column("user_id", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("portfolio_name", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("asset_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            "quantity", sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False
        ),
        sa.Column(
            "purchase_price", sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True
        ),
        sa.Column("purchase_date", postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
        sa.CheckConstraint("quantity >= 0::double precision", name="check_quantity_nonnegative"),
        sa.ForeignKeyConstraint(["asset_id"], ["assets.id"], name="portfolio_asset_id_fkey"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="portfolio_user_id_fkey"),
        sa.PrimaryKeyConstraint("user_id", "portfolio_name", "asset_id", name="portfolio_pkey"),
    )
    op.create_index("ix_portfolio_user_id", "portfolio", ["user_id"], unique=False)
    op.create_index("ix_portfolio_portfolio_name", "portfolio", ["portfolio_name"], unique=False)
    op.create_index("ix_portfolio_asset_id", "portfolio", ["asset_id"], unique=False)
    op.drop_index(op.f("ix_transactions_id"), table_name="transactions")
    op.drop_index("ix_transaction_user_portfolio", table_name="transactions")
    op.drop_table("transactions")
    # ### end Alembic commands ###
