from dataclasses import dataclass


@dataclass
class BuyAction:
    asset_id: int
    dollar_amount: float


@dataclass
class SellAction:
    asset_id: int
    quantity: float


Action = BuyAction | SellAction
