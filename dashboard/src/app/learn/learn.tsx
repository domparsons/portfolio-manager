import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  BarChart3,
  TrendingDown,
  Target,
  Calendar,
  LineChart,
  Wallet,
  History,
} from "lucide-react";

const Learn = () => {
  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Understanding Your Investments</h1>
        <p className="text-muted-foreground text-lg">
          Learn how to use portfolio metrics and backtesting to make informed
          investment decisions
        </p>
      </div>

      {/* What is This App */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <CardTitle>What is Portfolio Manager?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Portfolio Manager is designed for casual long-term investors who
            want to understand how their investment strategies would have
            performed historically. Unlike traditional tools that separate
            portfolio tracking from backtesting, we bring both together in one
            place.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                Track Your Portfolio
              </h4>
              <p className="text-sm text-muted-foreground">
                Monitor your current holdings, performance, and portfolio
                composition in real-time
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Test Strategies
              </h4>
              <p className="text-sm text-muted-foreground">
                Run historical backtests on your actual portfolio holdings to
                see how different strategies would have performed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Understanding Risk Metrics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Understanding Risk Metrics</h2>
        <p className="text-muted-foreground">
          Risk metrics help you evaluate the quality and stability of your
          investment returns. Here's what each metric tells you:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Sharpe Ratio</CardTitle>
              </div>
              <CardDescription>Risk-adjusted returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Measures how much return you're getting for the risk you're
                taking. A higher Sharpe ratio means better risk-adjusted
                performance.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold">What it means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <span className="text-green-500 font-medium">
                      &gt; 2.0
                    </span>
                    : Excellent - high returns relative to risk
                  </li>
                  <li>
                    <span className="text-blue-500 font-medium">1.0-2.0</span>:
                    Good - acceptable risk/return balance
                  </li>
                  <li>
                    <span className="text-red-500 font-medium">&lt; 0</span>:
                    Poor - returns don't justify the risk
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg">Maximum Drawdown</CardTitle>
              </div>
              <CardDescription>Peak-to-trough decline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The largest drop from peak to trough. This tells you the worst
                loss you would have experienced at any point.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold">What it means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <span className="text-green-500 font-medium">
                      &lt; -10%
                    </span>
                    : Low - minimal downside
                  </li>
                  <li>
                    <span className="text-yellow-500 font-medium">
                      -10% to -20%
                    </span>
                    : Moderate - typical market corrections
                  </li>
                  <li>
                    <span className="text-red-500 font-medium">
                      &gt; -20%
                    </span>
                    : High - significant losses
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-lg">Volatility</CardTitle>
              </div>
              <CardDescription>Price fluctuation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Measures how much your returns swing up and down. Lower
                volatility means more stable, predictable returns.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold">What it means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <span className="text-green-500 font-medium">
                      &lt; 15%
                    </span>
                    : Low - stable returns
                  </li>
                  <li>
                    <span className="text-yellow-500 font-medium">
                      15-25%
                    </span>
                    : Moderate - normal fluctuations
                  </li>
                  <li>
                    <span className="text-red-500 font-medium">&gt; 25%</span>:
                    High - significant swings
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">Drawdown Duration</CardTitle>
              </div>
              <CardDescription>Recovery time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                How long it took to recover from the worst decline. Shorter
                durations mean faster recovery.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold">What it means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <span className="text-green-500 font-medium">
                      &lt; 30 days
                    </span>
                    : Quick recovery
                  </li>
                  <li>
                    <span className="text-yellow-500 font-medium">
                      30-90 days
                    </span>
                    : Moderate recovery
                  </li>
                  <li>
                    <span className="text-red-500 font-medium">
                      &gt; 90 days
                    </span>
                    : Extended recovery
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Using Backtests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">How Backtesting Helps You</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <CardTitle>Test Before You Invest</CardTitle>
            </div>
            <CardDescription>
              See how strategies would have performed historically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Backtesting lets you run historical simulations using your actual
              portfolio holdings. This helps you understand how different
              investment strategies might perform without risking real money.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Popular Strategies to Test:</h4>
                <div className="space-y-3">
                  <div className="border-l-2 border-blue-500 pl-4">
                    <h5 className="font-medium">Dollar-Cost Averaging (DCA)</h5>
                    <p className="text-sm text-muted-foreground">
                      Invest a fixed amount at regular intervals (e.g., $100
                      every month). This strategy reduces the impact of
                      volatility by spreading purchases over time.
                    </p>
                  </div>
                  <div className="border-l-2 border-green-500 pl-4">
                    <h5 className="font-medium">Buy and Hold</h5>
                    <p className="text-sm text-muted-foreground">
                      Invest a lump sum and hold it long-term. This strategy
                      works well when you believe in long-term growth and want
                      to minimize trading costs.
                    </p>
                  </div>
                  <div className="border-l-2 border-purple-500 pl-4">
                    <h5 className="font-medium">Lump Sum</h5>
                    <p className="text-sm text-muted-foreground">
                      Invest all your capital at once. Historical data shows
                      this often outperforms DCA, but timing matters more.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">What to Look For:</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>
                    <span className="font-medium text-foreground">
                      Total Return
                    </span>
                    : How much your investment would have grown
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Risk Metrics
                    </span>
                    : Compare Sharpe ratio, drawdown, and volatility across
                    strategies
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Consistency
                    </span>
                    : Look for strategies that perform well across different
                    time periods
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Your Risk Tolerance
                    </span>
                    : Choose strategies that match your comfort with market
                    swings
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Start making data-driven investment decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">
                Add your portfolio holdings
              </span>{" "}
              - Input the stocks you own or are interested in
            </li>
            <li>
              <span className="font-medium text-foreground">
                Review your risk metrics
              </span>{" "}
              - Understand your current portfolio's risk profile
            </li>
            <li>
              <span className="font-medium text-foreground">
                Run backtests
              </span>{" "}
              - Test different investment strategies on historical data
            </li>
            <li>
              <span className="font-medium text-foreground">
                Compare results
              </span>{" "}
              - See how different approaches would have performed
            </li>
            <li>
              <span className="font-medium text-foreground">
                Apply insights
              </span>{" "}
              - Use what you learned to inform your investment decisions
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Important Note:
            </span>{" "}
            Past performance does not guarantee future results. Backtesting
            shows how strategies would have performed historically, but markets
            change. Use these tools as one part of your research, not as the
            sole basis for investment decisions. Consider consulting a financial
            advisor for personalized advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export { Learn };
