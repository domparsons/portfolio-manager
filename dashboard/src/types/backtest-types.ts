import { Asset } from "@/types/custom-types";
import React from "react";
import { BuyAndHoldForm } from "@/app/backtesting/strategies/buy-and-hold";
import { DCAForm } from "@/app/backtesting/strategies/dca";
import { VAForm } from "@/app/backtesting/strategies/va";

export type BacktestStrategy =
  | "buy_and_hold"
  | "dollar_cost_averaging"
  | "value_averaging";

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
  tickers: string[];
  start_date: string;
  end_date: string;
  initial_cash: number | undefined;
  parameters: Record<string, any>;
}

export interface LLMBacktestParams {
  strategy: BacktestStrategy;
  asset_ids: number[];
  tickers: string[];
  start_date: string;
  end_date: string;
  initial_cash: number | undefined;
  parameters: Record<string, any>;
  comment: string;
  reasoning: string;
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

export const STRATEGY_NAMES: Record<BacktestStrategy, string> = {
  buy_and_hold: "Buy and Hold",
  dollar_cost_averaging: "Dollar Cost Averaging",
  value_averaging: "Value Averaging",
};

export const STRATEGY_FORMS: Record<
  BacktestStrategy,
  React.FC<StrategyFormProps>
> = {
  buy_and_hold: BuyAndHoldForm,
  dollar_cost_averaging: DCAForm,
  value_averaging: VAForm,
};

// types/backtest.ts

export interface PreviousBacktest {
  id: number;
  created_at: string;

  // Request parameters
  strategy: string;
  asset_ids: number[];
  tickers: string[];
  start_date: string;
  end_date: string;
  initial_cash: number;
  parameters: Record<string, any>;

  // Computed results
  total_invested: number;
  final_value: number;
  total_return_abs: number;
  total_return_pct: number;
  avg_daily_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  max_drawdown_duration: number;
  volatility: number;
  investments_made: number;
  peak_value: number;
  trough_value: number;
  trading_days: number;
}
