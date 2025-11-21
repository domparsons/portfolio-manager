import React from "react";

export interface Transaction {
  id: number;
  timestamp: string;
  quantity: number;
  asset_name: string;
  ticker: string;
  type: TransactionType;
  price: number;
}

export interface TimeseriesChartData {
  date: string;
  value: number;
  daily_return_pct?: number | undefined;
}

export interface PortfolioHoldings {
  asset_id: string;
  asset_name: string;
  net_quantity_shares: number;
  average_cost_basis: number;
  total_cost: number;
  current_price: number;
  net_value: number;
  unrealised_gain_loss: number;
  unrealised_gain_loss_pct: number;
}

type TransactionType = "buy" | "sell";

export interface Asset {
  id: number;
  asset_name: string;
  ticker: string;
  market_cap: number;
  price_change: number;
  percentage_change: number;
  latest_price: number;
  currency: string;
  description: string;
  timestamp: string;
  in_watchlist: boolean;
}

export interface Portfolio {
  id: number;
  close: number;
  timestamp: string;
}

export interface AssetTableProps {
  filteredAssets: Asset[];
}

export interface AssetSheetPopoverProps {
  timeseries: Portfolio[];
  pageAsset: Asset;
  timeseriesRange: string;
  setTimeseriesRange: React.Dispatch<React.SetStateAction<string>>;
  pageAssetInWatchlist: boolean | undefined;
  setPageAssetInWatchlist: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
}

export interface PortfolioCardProps {}

export interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: () => void;
}

export interface PortfolioMetrics {
  total_invested: number;
  current_value: number;
  total_return_abs: number;
  total_return_pct: number;
  start_date: string;
  end_date: string;
  days_analysed: number;
  sharpe: number;
  max_drawdown: number;
  volatility: number;
}

export interface PortfolioContextType {
  portfolioMetrics: PortfolioMetrics | null;
  loading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
}
