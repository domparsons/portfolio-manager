export type MonteCarloStrategies =
  | "Normal Distribution"
  | "Bootstrap"
  | "T-Student";

export const MONTE_CARLO_STRATEGY_NAMES: Record<MonteCarloStrategies, string> =
  {
    "Normal Distribution": "Normal Distribution",
    Bootstrap: "Bootstrap",
    "T-Student": "T-Student",
  };

export interface MonteCarloParams {
  ticker: number;
  monthly_investment: number;
  investment_months: number;
  simulation_method: MonteCarloStrategies;
}

export interface MonteCarloChartDataPoint {
  month: number;
  invested: number;
  p5: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

export interface MonteCarloHistogramBucket {
  min: number;
  max: number;
  count: number;
}

export interface MonteCarloRiskMetrics {
  probability_of_loss: number;
  mean_return: number;
  std_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  var_95: number;
  cvar_95: number;
}

export interface MonteCarloResult {
  chart_data: MonteCarloChartDataPoint[];
  sample_paths: number[][];
  histogram: MonteCarloHistogramBucket[];
  total_invested: number;
  final_percentiles: Record<number, number>;
  risk_metrics: MonteCarloRiskMetrics;
}
