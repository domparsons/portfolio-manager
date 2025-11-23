import polars as pl

from app.models import Asset


def generate_asset_list(
    assets: list[Asset], latest_timeseries: pl.DataFrame
) -> list[dict]:
    assets_data = [asset.__dict__ for asset in assets]
    assets_df = pl.DataFrame(assets_data)
    assets_df = assets_df.with_columns(pl.col("id").alias("asset_id"))
    asset_list = assets_df.join(latest_timeseries, on="asset_id", how="inner")
    asset_list = asset_list.to_dicts()

    return asset_list
