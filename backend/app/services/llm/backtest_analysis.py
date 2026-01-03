from pathlib import Path

from app.config.settings import settings
from app.logger import logger
from app.schemas.backtest import BacktestAnalysis
from fastapi import HTTPException
from openai import OpenAI, OpenAIError

MODULE_DIR = Path(__file__).parent

VALID_STRATEGIES = {"buy_and_hold", "dollar_cost_averaging", "value_averaging"}
MAX_HISTORICAL_YEARS = 10
MAX_RETRIES = 2


class LLMValidationError(Exception):
    """Raised when LLM output fails validation"""

    pass


def analyse_backtest(user_result: BacktestAnalysis, benchmark_result: BacktestAnalysis):
    if not user_result or not benchmark_result:
        raise HTTPException(status_code=400, detail="Please provide valid backtests")

    for attempt in range(MAX_RETRIES):
        try:
            instructions = _load_instructions()
            formatted_user_backtest = _format_backtest_result(user_result)
            formatted_benchmark = _format_backtest_result(benchmark_result)
            backtest_inputs = f"""
            {formatted_user_backtest}

            ---

            BENCHMARK COMPARISON (S&P 500)
            {formatted_benchmark}
            """
            response = _call_llm(backtest_inputs, instructions)

            logger.info(
                f"Successfully analysed backtest. Attempt {attempt + 1}",
            )

            return response

        except OpenAIError as e:
            logger.warning(f"LLM API error (attempt {attempt + 1}): {str(e)}")
            if attempt == MAX_RETRIES - 1:
                raise HTTPException(
                    status_code=503,
                    detail="LLM service temporarily unavailable. Please try again.",
                )
            continue

        except LLMValidationError as e:
            logger.error(f"Validation failed: {str(e)}")
            raise HTTPException(
                status_code=400, detail=f"Could not parse strategy: {str(e)}"
            )
    return None


def _format_backtest_result(backtest: BacktestAnalysis) -> str:
    """Format backtest for LLM analysis - summary only, no full history"""
    result = backtest.data

    num_days = len(result.history)
    avg_daily_return = result.total_return_pct / num_days if num_days > 0 else 0

    peak_value = (
        max(s.value for s in result.history) if result.history else result.final_value
    )
    trough_value = (
        min(s.value for s in result.history) if result.history else result.final_value
    )
    params = backtest.parameters.get("parameters", {})

    # Handle None case
    if params is None:
        params = {}

    if params:
        param_str = ", ".join(f"{k}={v}" for k, v in params.items())
    else:
        param_str = "None"

    formatted = f"""
USER BACKTEST SUMMARY

Strategy: {backtest.strategy.upper()}
Parameters: {", ".join(f"{k}={v}" for k, v in (backtest.parameters.get("parameters") or {}).items()) or "None"}
Time Period: {result.start_date.strftime("%B %d, %Y")} to {result.end_date.strftime("%B %d, %Y")}
Duration: {num_days} trading days
Tickers: {(", ".join(backtest.tickers))}

PERFORMANCE
Initial Investment: ${float(result.total_invested):,.2f}
Final Portfolio Value: ${float(result.final_value):,.2f}
Absolute Gain/Loss: ${float(result.total_return_abs):,.2f}
Percentage Return: {float(result.total_return_pct * 100):.2f}%
Average Daily Return: {float(avg_daily_return):.2f}%

RISK METRICS
Sharpe Ratio: {float(result.metrics.sharpe):.3f}
Maximum Drawdown: {float(result.metrics.max_drawdown * 100):.2f}%
Drawdown Duration: {result.metrics.max_drawdown_duration} days
Annualized Volatility: {float(result.metrics.volatility * 100):.2f}%

ACTIVITY
Number of Investments: {result.metrics.investments_made}
Peak Portfolio Value: ${float(peak_value):,.2f}
Lowest Portfolio Value: ${float(trough_value):,.2f}
"""

    return formatted


def _call_llm(backtest_input: str, instructions: str) -> str:
    client = OpenAI(api_key=settings.OPEN_AI_API_KEY)

    try:
        response = client.responses.parse(
            model="gpt-4.1-2025-04-14",
            input=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": backtest_input},
            ],
        )

        result = response.output[0].content[0].text
        return result

    except Exception as e:
        logger.error(f"LLM parsing failed: {str(e)}")
        raise OpenAIError(f"Failed to parse LLM response: {str(e)}")


def _load_instructions() -> str:
    with open(MODULE_DIR / "prompts/backtest_analysis_instructions.txt", "r") as f:
        instructions = f.read()

    return instructions
