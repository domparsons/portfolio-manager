import {
  checkAssetInWatchlist,
  getAssetByTicker,
  getTimeseriesDataForAsset,
  Portfolio,
} from "@/api/asset";
import React, { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { AssetPage } from "./asset-page";

const AssetPageWrapper = () => {
  const { ticker } = useParams();
  const [pageAsset, setPageAsset] = useState(null);
  const [pageAssetInWatchlist, setPageAssetInWatchlist] = useState<
    boolean | null
  >(null);
  const [timeseries, setTimeseries] = useState<Portfolio[]>([]);
  const [timeseriesRange, setTimeseriesRange] = useState<string>("1Y");

  const fetchData = async () => {
    const asset = await getAssetByTicker(ticker);
    const user_id = localStorage.getItem("user_id");
    const assetInWatchlist = await checkAssetInWatchlist(ticker, user_id);

    if (!asset) {
      console.error("Asset not found for ticker:", ticker);
      return;
    }

    setPageAsset(asset);
    setPageAssetInWatchlist(assetInWatchlist);
    await getTimeseriesDataForAsset(asset.id, setTimeseries, timeseriesRange);
  };

  useEffect(() => {
    if (ticker) {
      fetchData();
    }
  }, [ticker, timeseriesRange]);

  if (!pageAsset) {
    return <div className="text-center mt-10">Loading asset...</div>;
  }
  if (pageAsset && timeseries.length === 0) {
    return (
      <div className="text-center mt-10">No data available for this asset.</div>
    );
  }

  return (
    <AssetPage
      pageAsset={pageAsset}
      timeseries={timeseries}
      timeseriesRange={timeseriesRange}
      setTimeseriesRange={setTimeseriesRange}
      pageAssetInWatchlist={pageAssetInWatchlist}
      setPageAssetInWatchlist={setPageAssetInWatchlist}
    />
  );
};

export default AssetPageWrapper;
