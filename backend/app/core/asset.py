import polars as pl


def generate_asset_list(assets, latest_timeseries):
    assets = assets.with_columns(pl.col("id").alias("asset_id"))
    asset_list = assets.join(latest_timeseries, on="asset_id", how="inner")
    asset_list = asset_list.to_dicts()

    return asset_list
