import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, BarChart3, TrendingDown, Calendar } from "lucide-react";

const Learn = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Understanding Your Investments</h1>
        <p className="text-muted-foreground">
          Learn how to use portfolio metrics, backtesting, and simulation to
          make informed investment decisions.
        </p>
      </div>

      {/* Risk Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Risk Metrics</h2>
        <div className="grid gap-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-2 font-semibold">
                <Activity className="h-5 w-5 text-blue-500" />
                Sharpe Ratio
              </div>
              <p className="text-sm text-muted-foreground">
                Measures how much return you're getting for the risk you're
                taking. A higher Sharpe ratio means better risk-adjusted
                performance.
              </p>
              <div className="space-y-1">
                <p className="text-xs font-semibold">What it means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <span className="text-green-500 font-medium">&gt; 3.0</span>
                    : Excellent - high returns relative to risk
                  </li>
                  <li>
                    <span className="text-green-500 font-medium">2.0–3.0</span>:
                    Very Good
                  </li>
                  <li>
                    <span className="text-blue-500 font-medium">1.0–2.0</span>:
                    Good - acceptable risk/return balance
                  </li>
                  <li>
                    <span className="text-yellow-500 font-medium">0–1.0</span>:
                    Fair
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
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-2 font-semibold">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Maximum Drawdown
              </div>
              <p className="text-sm text-muted-foreground">
                The largest drop from peak to trough. This tells you the worst
                loss you would have experienced at any point.
              </p>
              <div className="space-y-1">
                <p className="text-xs font-semibold">What it means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <span className="text-green-500 font-medium">&gt; -5%</span>
                    : Minimal downside
                  </li>
                  <li>
                    <span className="text-green-500 font-medium">
                      -5% to -10%
                    </span>
                    : Low - manageable decline
                  </li>
                  <li>
                    <span className="text-yellow-500 font-medium">
                      -10% to -20%
                    </span>
                    : Moderate - typical market corrections
                  </li>
                  <li>
                    <span className="text-red-500 font-medium">&lt; -20%</span>:
                    High - significant losses
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-2 font-semibold">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Volatility
              </div>
              <p className="text-sm text-muted-foreground">
                Measures how much your returns swing up and down. Lower
                volatility means more stable, predictable returns.
              </p>
              <div className="space-y-1">
                <p className="text-xs font-semibold">What it means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <span className="text-green-500 font-medium">&lt; 20%</span>
                    : Low - stable returns
                  </li>
                  <li>
                    <span className="text-yellow-500 font-medium">20–30%</span>:
                    Moderate - normal fluctuations
                  </li>
                  <li>
                    <span className="text-red-500 font-medium">&gt; 30%</span>:
                    High - significant swings
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-2 font-semibold">
                <Calendar className="h-5 w-5 text-orange-500" />
                Drawdown Duration
              </div>
              <p className="text-sm text-muted-foreground">
                How long it took to recover from the worst decline. Shorter
                durations mean faster recovery.
              </p>
              <div className="space-y-1">
                <p className="text-xs font-semibold">What it means:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <span className="text-green-500 font-medium">
                      &lt; 20 days
                    </span>
                    : Quick recovery
                  </li>
                  <li>
                    <span className="text-yellow-500 font-medium">
                      20–60 days
                    </span>
                    : Moderate recovery
                  </li>
                  <li>
                    <span className="text-red-500 font-medium">
                      &gt; 60 days
                    </span>
                    : Extended recovery
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Backtesting */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Backtesting</h2>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Backtesting lets you run historical simulations using your actual
              portfolio holdings. This helps you understand how different
              investment strategies might perform without risking real money.
            </p>

            <div className="space-y-2">
              <h4 className="font-semibold">Strategies to Test:</h4>
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h5 className="font-medium">Dollar-Cost Averaging (DCA)</h5>
                  <p className="text-sm text-muted-foreground">
                    Invest a fixed amount at regular intervals (e.g., $100 every
                    month). This strategy reduces the impact of volatility by
                    spreading purchases over time.
                  </p>
                </div>
                <div className="border-l-2 border-green-500 pl-4">
                  <h5 className="font-medium">Buy and Hold</h5>
                  <p className="text-sm text-muted-foreground">
                    Invest a lump sum and hold it long-term. This strategy works
                    well when you believe in long-term growth and want to
                    minimise trading costs.
                  </p>
                </div>
                <div className="border-l-2 border-purple-500 pl-4">
                  <h5 className="font-medium">Lump Sum</h5>
                  <p className="text-sm text-muted-foreground">
                    Invest all your capital at once. Historical data shows this
                    often outperforms DCA, but timing matters more.
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
                  : Look for strategies that perform well across different time
                  periods
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Your Risk Tolerance
                  </span>
                  : Choose strategies that match your comfort with market swings
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monte Carlo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Monte Carlo Simulation</h2>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Monte Carlo simulation uses random variables to simulate different
              performance outcomes for an asset. Rather than predicting a single
              future, it runs thousands of possible scenarios based on
              historical returns and volatility, giving you a realistic range of
              outcomes.
            </p>

            <div className="space-y-2">
              <h4 className="font-semibold">Simulation Methods:</h4>
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h5 className="font-medium">Normal Distribution</h5>
                  <p className="text-sm text-muted-foreground">
                    Generates returns using a bell curve based on the asset's
                    historical mean and standard deviation. Fast and simple, but
                    assumes returns are symmetric — it won't capture extreme
                    market events well.
                  </p>
                </div>
                <div className="border-l-2 border-purple-500 pl-4">
                  <h5 className="font-medium">T-Student</h5>
                  <p className="text-sm text-muted-foreground">
                    Similar to Normal Distribution but with heavier tails,
                    meaning it assigns more probability to extreme outcomes. A
                    better fit for assets that occasionally experience large
                    swings.
                  </p>
                </div>
                <div className="border-l-2 border-orange-500 pl-4">
                  <h5 className="font-medium">Bootstrap</h5>
                  <p className="text-sm text-muted-foreground">
                    Resamples directly from the asset's actual historical
                    returns rather than fitting a mathematical distribution. The
                    most realistic method — it preserves the true shape of past
                    behaviour, including crashes and rallies.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">What the Simulation Shows:</h4>
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h5 className="font-medium">Median Outcome</h5>
                  <p className="text-sm text-muted-foreground">
                    The middle result across all simulations — half of scenarios
                    performed better, half performed worse. A useful baseline
                    expectation.
                  </p>
                </div>
                <div className="border-l-2 border-green-500 pl-4">
                  <h5 className="font-medium">Confidence Bands</h5>
                  <p className="text-sm text-muted-foreground">
                    The shaded range shows where most outcomes fall. A wider
                    band means higher uncertainty — typically seen in more
                    volatile assets.
                  </p>
                </div>
                <div className="border-l-2 border-red-500 pl-4">
                  <h5 className="font-medium">Worst Case</h5>
                  <p className="text-sm text-muted-foreground">
                    The lower tail of simulations. Useful for understanding
                    downside risk — how bad could it realistically get?
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">What to Look For:</h4>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>
                  <span className="font-medium text-foreground">
                    Spread of outcomes
                  </span>
                  : A wide range means the asset is harder to predict — higher
                  potential reward but also higher risk
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Median trajectory
                  </span>
                  : Does the expected path align with your investment goals?
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Downside scenarios
                  </span>
                  : Can you tolerate the worst-case outcomes shown?
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Important Note:
            </span>{" "}
            Past performance does not guarantee future results. Backtesting
            shows how strategies would have performed historically, but markets
            change. Monte Carlo simulation models possible futures based on
            historical data — it is not a prediction, and real outcomes may fall
            outside any simulated range. Use these tools as one part of your
            research, not as the sole basis for investment decisions. Consider
            consulting a financial advisor for personalised advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export { Learn };
