export type BacktestStrategy = "dca" | "buy_and_hold" | "lump_sum";

export interface BacktestResult {
  portfolio_values: Array<{
    date: string;
    value: number;
  }>;
  metrics: {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    volatility: number;
  };
  transactions: Array<{
    date: string;
    action: string;
    quantity: number;
    price: number;
  }>;
}

export interface BacktestParams {
  strategy: BacktestStrategy;
  asset_ids: number[];
  start_date: string;
  end_date: string;
  initial_cash: number;
  parameters: Record<string, any>;
}

export interface StrategyFormProps {
  onSubmit: (params: BacktestParams) => Promise<void>;
  isLoading: boolean;
}
