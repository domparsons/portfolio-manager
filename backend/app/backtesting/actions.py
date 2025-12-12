from dataclasses import dataclass
from decimal import Decimal


@dataclass
class BuyAction:
    asset_id: int
    dollar_amount: Decimal


@dataclass
class SellAction:
    asset_id: int
    quantity: Decimal


Action = BuyAction | SellAction
