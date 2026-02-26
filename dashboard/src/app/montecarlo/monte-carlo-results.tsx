import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { MonteCarloResult } from "@/types/monte-carlo-types";

const fmt = (n: number) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const fmtAxis = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v.toFixed(0)}`;
};

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const MonteCarloResults = ({ results }: { results: MonteCarloResult }) => {
  const { risk_metrics: rm, final_percentiles: fp, total_invested } = results;

  // --- Fan chart data ---
  // Each band uses a separate stackId: a transparent base area stacks the
  // visible span on top so it renders from pX to pY, not from zero.
  const fanData = results.chart_data.map((d, i) => ({
    month: d.month,
    // Raw percentiles (used in tooltip)
    p5: d.p5,
    p10: d.p10,
    p25: d.p25,
    p50: d.p50,
    p75: d.p75,
    p90: d.p90,
    p95: d.p95,
    invested: d.invested,
    // Stacked band: outer P5–P95
    p5_base: d.p5,
    outer_span: d.p95 - d.p5,
    // Stacked band: middle P10–P90
    p10_base: d.p10,
    mid_span: d.p90 - d.p10,
    // Stacked band: inner P25–P75
    p25_base: d.p25,
    inner_span: d.p75 - d.p25,
    // 20 sampled individual paths
    ...Object.fromEntries(
      results.sample_paths.map((path, idx) => [`s${idx}`, path[i]]),
    ),
  }));

  // --- Histogram data ---
  const histData = results.histogram.map((b) => ({
    midpoint: (b.min + b.max) / 2,
    rangeLabel: `${fmt(b.min)}–${fmt(b.max)}`,
    count: b.count,
  }));

  const fanConfig = {
    p50: { label: "Median (P50)", color: "#8b5cf6" },
    invested: { label: "Total Invested", color: "#6b7280" },
  } satisfies ChartConfig;

  const histConfig = {
    count: { label: "Simulations", color: "#8b5cf6" },
  } satisfies ChartConfig;

  const summaryCards = [
    {
      label: "Pessimistic (P10)",
      value: fmt(fp[10]),
      sub: `${pct((fp[10] - total_invested) / total_invested)} return`,
      color: "text-red-500",
    },
    {
      label: "Median (P50)",
      value: fmt(fp[50]),
      sub: `${pct((fp[50] - total_invested) / total_invested)} return`,
      color: "text-blue-500",
    },
    {
      label: "Optimistic (P90)",
      value: fmt(fp[90]),
      sub: `${pct((fp[90] - total_invested) / total_invested)} return`,
      color: "text-green-500",
    },
    {
      label: "Prob. of Loss",
      value: pct(rm.probability_of_loss),
      sub: "Portfolio finishes below invested",
      color:
        rm.probability_of_loss > 0.3
          ? "text-red-500"
          : rm.probability_of_loss > 0.1
            ? "text-yellow-500"
            : "text-green-500",
    },
  ];

  const riskRows = [
    {
      label: "Sharpe Ratio",
      value: rm.sharpe_ratio.toFixed(2),
      color:
        rm.sharpe_ratio > 1
          ? "text-green-500"
          : rm.sharpe_ratio > 0
            ? "text-yellow-500"
            : "text-red-500",
    },
    {
      label: "Max Drawdown",
      value: pct(rm.max_drawdown),
      color:
        rm.max_drawdown > -0.1
          ? "text-green-500"
          : rm.max_drawdown > -0.2
            ? "text-yellow-500"
            : "text-red-500",
    },
    {
      label: "Mean Return",
      value: pct(rm.mean_return),
      color: rm.mean_return > 0 ? "text-green-500" : "text-red-500",
    },
    {
      label: "Std. Deviation",
      value: pct(rm.std_return),
      color: "text-foreground",
    },
    { label: "VaR (95%)", value: pct(rm.var_95), color: "text-red-500" },
    { label: "CVaR (95%)", value: pct(rm.cvar_95), color: "text-red-500" },
  ];

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold">Simulation Results</h2>

      {/* Summary stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fan / cone chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Value Over Time</CardTitle>
          <CardDescription>
            Bands show P5–P95, P10–P90, and P25–P75 outcome ranges. Faint lines
            are 20 individual sampled paths. Dashed line = median. Grey = total
            invested.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={fanConfig} className="h-80 w-full">
            <ComposedChart
              data={fanData}
              margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => `Mo ${v}`}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={fmtAxis}
                width={48}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm space-y-1 text-xs">
                      <p className="font-medium text-muted-foreground">
                        Month {d.month}
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                        <span className="text-muted-foreground">Invested</span>
                        <span className="font-semibold text-right">
                          {fmt(d.invested)}
                        </span>
                        <span className="text-green-500">P90</span>
                        <span className="font-semibold text-right text-green-500">
                          {fmt(d.p90)}
                        </span>
                        <span className="text-[#8b5cf6]">Median</span>
                        <span className="font-semibold text-right text-[#8b5cf6]">
                          {fmt(d.p50)}
                        </span>
                        <span className="text-red-500">P10</span>
                        <span className="font-semibold text-right text-red-500">
                          {fmt(d.p10)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Outer band: P5–P95 (lightest) */}
              <Area
                stackId="outer"
                dataKey="p5_base"
                fill="transparent"
                stroke="none"
                isAnimationActive={false}
                legendType="none"
              />
              <Area
                stackId="outer"
                dataKey="outer_span"
                fill="rgba(139,92,246,0.08)"
                stroke="none"
                isAnimationActive={false}
                legendType="none"
              />

              {/* Middle band: P10–P90 */}
              <Area
                stackId="mid"
                dataKey="p10_base"
                fill="transparent"
                stroke="none"
                isAnimationActive={false}
                legendType="none"
              />
              <Area
                stackId="mid"
                dataKey="mid_span"
                fill="rgba(139,92,246,0.13)"
                stroke="none"
                isAnimationActive={false}
                legendType="none"
              />

              {/* Inner band: P25–P75 (darkest) */}
              <Area
                stackId="inner"
                dataKey="p25_base"
                fill="transparent"
                stroke="none"
                isAnimationActive={false}
                legendType="none"
              />
              <Area
                stackId="inner"
                dataKey="inner_span"
                fill="rgba(139,92,246,0.22)"
                stroke="none"
                isAnimationActive={false}
                legendType="none"
              />

              {/* 20 sampled individual paths — low opacity background texture */}
              {results.sample_paths.map((_, idx) => (
                <Line
                  key={`s${idx}`}
                  dataKey={`s${idx}`}
                  stroke="rgba(139,92,246,0.15)"
                  strokeWidth={0.75}
                  dot={false}
                  isAnimationActive={false}
                  legendType="none"
                  tooltipType="none"
                />
              ))}

              {/* Median line */}
              <Line
                dataKey="p50"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                legendType="none"
              />

              {/* Total invested reference */}
              <Line
                dataKey="invested"
                stroke="#6b7280"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                legendType="none"
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Outcome distribution histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Final Value Distribution</CardTitle>
            <CardDescription>
              Distribution of final portfolio values across all simulations.
              Grey line = total invested.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={histConfig} className="h-64 w-full">
              <BarChart
                data={histData}
                margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  type="number"
                  dataKey="midpoint"
                  domain={["dataMin", "dataMax"]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={fmtAxis}
                  minTickGap={40}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={36}
                />
                <ReferenceLine
                  x={total_invested}
                  stroke="#6b7280"
                  strokeDasharray="3 3"
                  label={{
                    value: "Invested",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "#6b7280",
                  }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs space-y-0.5">
                        <p className="text-muted-foreground">{d.rangeLabel}</p>
                        <p className="font-semibold">
                          {d.count.toLocaleString()} simulations
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Risk metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>
              Simulation risk and return statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {riskRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-semibold ${row.color}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { MonteCarloResults };
