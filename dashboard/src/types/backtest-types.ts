import { Asset } from "@/types/custom-types";

export type BacktestStrategy = "dca" | "buy_and_hold";

export interface BacktestResult {
  backtest_id: string;
  strategy: string;
  parameters: Record<string, any>;
  data: {
    start_date: string;
    end_date: string;
    total_invested: number;
    final_value: number;
    total_return_pct: number;
    total_return_abs: number;
    metrics: {
      sharpe: number;
      max_drawdown: number;
      max_drawdown_duration: number;
      volatility: number;
      days_analysed: number;
      investments_made: number;
    };
    history: Array<{
      date: string;
      value: number;
      cash: number;
      holdings: Record<string, number>;
      cash_flow: number;
      daily_return_pct: number;
      daily_return_abs: number;
    }>;
  };
}

export interface BacktestParams {
  strategy: BacktestStrategy;
  asset_ids: number[];
  start_date: string;
  end_date: string;
  initial_cash: number | undefined;
  parameters: Record<string, any>;
}

export interface StrategyFormProps {
  onSubmit: (params: BacktestParams) => Promise<void>;
  isLoading: boolean;
  assets: Asset[];
  setFilteredAssets: (assets: Asset[]) => void;
  filteredAssets: Asset[];
}

export interface SingleAssetSelectorProps {
  assets: Asset[];
  selectedAsset: Asset | undefined;
  setSelectedAsset: (assets: Asset | undefined) => void;
}

export const DCA_FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;

export type DCAFrequencies =
  (typeof DCA_FREQUENCIES)[keyof typeof DCA_FREQUENCIES];

export const DCA_FREQUENCY_OPTIONS = Object.values(DCA_FREQUENCIES);
