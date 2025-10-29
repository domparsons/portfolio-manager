export interface Transaction {
  id: number;
  timestamp: string;
  quantity: number;
  asset_name: string;
  ticker: string;
  type: TransactionType;
  price: number;
}

export interface PortfolioChartData {
  date: number;
  value: number;
  daily_return?: number;
}

export interface PortfolioValueHistory {
  date: string;
  value: number;
  daily_return?: number;
}

export interface PortfolioMetrics {
  total_invested: number;
  current_value: number;
  total_return_abs: number;
  total_return_pct: number;
  start_date: Date;
  end_date: Date;
  days_analysed: number;
}

export interface PortfolioHoldings {
  asset_id: string;
  asset_name: string;
  net_quantity_shares: number;
  net_value: number;
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
