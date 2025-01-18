import { useEffect, useState } from "react";
import React from "react";
import { Select } from "antd";
import { fetchWatchlist } from "../../../api/watchlist.js";

const WatchlistComponent = ({
  token,
  userId,
  defaultSymbol,
  onSymbolChange,
}) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedWatchlist = await fetchWatchlist(token, userId); // Replace with your actual API call
        setWatchlist(fetchedWatchlist);
      } catch (error) {
        console.error("Failed to fetch the watchlist:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, userId]);

  if (loading) {
    return <div>Loading watchlist...</div>;
  }

  return (
    <Select
      defaultValue={defaultSymbol}
      style={{ width: 120 }}
      onChange={(value) => onSymbolChange(value)} // Pass selected symbol back to parent
      options={watchlist.map((item) => ({
        value: item.symbol,
        label: item.symbol, // Display the symbol in the dropdown
      }))}
    />
  );
};

export default WatchlistComponent;
