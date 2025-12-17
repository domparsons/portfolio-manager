from datetime import date, datetime, timedelta
from decimal import Decimal
from pathlib import Path

from app import crud
from app.config.settings import settings
from app.logger import logger
from app.schemas.asset import AssetDataAvailability
from app.schemas.backtest import LLMBacktestParams
from fastapi import HTTPException
from openai import OpenAI, OpenAIError
from sqlalchemy.orm import Session

MODULE_DIR = Path(__file__).parent

VALID_STRATEGIES = {"buy_and_hold", "dca", "va"}
VALID_ASSET_IDS = set(range(1, 23))
MAX_HISTORICAL_YEARS = 10
MAX_RETRIES = 2


class LLMValidationError(Exception):
    """Raised when LLM output fails validation"""

    pass


def strategise_natural_language(
    user_input: str, db: Session
) -> LLMBacktestParams | None:
    """
    Parse natural language input into structured backtest parameters.

    Args:
        user_input: Natural language description of investment strategy

    Returns:
        Validated LLMBacktestParams

    Raises:
        HTTPException: If LLM service fails or validation fails after retries
    """
    if not user_input or not user_input.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")

    for attempt in range(MAX_RETRIES):
        try:
            asset_data = crud.get_assets_with_data_availability(db)
            instructions = _load_instructions(asset_data)
            result = _call_llm(user_input, instructions)
            validated = _validate_and_fix(result)

            logger.info(
                f"Successfully parsed strategy {validated.strategy} with asset id's {validated.asset_ids}. Attempt {attempt + 1}",
            )

            return validated

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


def _call_llm(user_input: str, instructions: str) -> LLMBacktestParams:
    """Make the actual LLM API call"""
    client = OpenAI(api_key=settings.OPEN_AI_API_KEY)

    try:
        response = client.responses.parse(
            model="gpt-4.1-2025-04-14",
            input=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": user_input},
            ],
            text_format=LLMBacktestParams,
        )

        result = response.output[0].content[0].parsed
        return result

    except Exception as e:
        logger.error(f"LLM parsing failed: {str(e)}")
        raise OpenAIError(f"Failed to parse LLM response: {str(e)}")


def _load_instructions(asset_data: list[AssetDataAvailability]) -> str:
    """Load and format instructions with current date"""
    with open(MODULE_DIR / "backtest_parameterisation_instructions.txt", "r") as f:
        instructions = f.read()

    today = date.today()
    instructions = instructions.replace("{today_date}", today.isoformat())

    asset_table_header = (
        "asset_id | asset_name | ticker | first_available_date | last_available_date"
    )
    asset_table_separator = "-" * 80

    asset_rows = [
        f"{asset.asset_id} | {asset.asset_name} | {asset.ticker} | "
        f"{asset.first_available_date.date() if isinstance(asset.first_available_date, datetime) else asset.first_available_date} | "
        f"{asset.last_available_date.date() if isinstance(asset.last_available_date, datetime) else asset.last_available_date}"
        for asset in asset_data
    ]

    asset_table = "\n".join([asset_table_header, asset_table_separator, *asset_rows])

    asset_section = f"""**Available Assets and Data Ranges**:\n{asset_table}"""

    return instructions + asset_section


def _validate_and_fix(params: LLMBacktestParams) -> LLMBacktestParams:
    """
    Validate LLM output and apply fixes where possible.
    Raises LLMValidationError if unfixable.
    """
    warnings = []

    if params.strategy not in VALID_STRATEGIES:
        raise LLMValidationError(
            f"Invalid strategy '{params.strategy}'. "
            f"Must be one of: {', '.join(VALID_STRATEGIES)}"
        )

    if not params.asset_ids:
        raise LLMValidationError("No assets specified")

    invalid_assets = [id for id in params.asset_ids if id not in VALID_ASSET_IDS]
    if invalid_assets:
        raise LLMValidationError(
            f"Invalid asset IDs: {invalid_assets}. Must be between 1 and 22."
        )

    today = date.today()
    yesterday = today - timedelta(days=1)
    oldest_allowed = today - timedelta(days=365 * MAX_HISTORICAL_YEARS)

    if params.end_date >= today:
        params.end_date = yesterday
        warnings.append(f"End date adjusted to {yesterday} (today excluded)")

    if params.start_date < oldest_allowed:
        params.start_date = oldest_allowed
        warnings.append(
            f"Start date adjusted to {oldest_allowed} "
            f"(only {MAX_HISTORICAL_YEARS} years of data available)"
        )

    if params.start_date >= params.end_date:
        raise LLMValidationError(
            f"Start date ({params.start_date}) must be before "
            f"end date ({params.end_date})"
        )

    date_diff = (params.end_date - params.start_date).days
    if date_diff < 7:
        raise LLMValidationError(
            f"Date range too short ({date_diff} days). "
            "Minimum 7 days required for meaningful backtest."
        )

    if params.initial_cash <= 0:
        raise LLMValidationError(
            f"Initial cash must be positive, got {params.initial_cash}"
        )

    if params.initial_cash > Decimal("10000000"):
        warnings.append("Unusually large initial cash amount")

    _validate_strategy_parameters(params)

    if warnings:
        warning_text = " | ".join(warnings)
        if params.comment:
            params.comment = f"{params.comment} [Adjusted: {warning_text}]"
        else:
            params.comment = f"Adjustments made: {warning_text}"

    return params


def _validate_strategy_parameters(params: LLMBacktestParams) -> None:
    """Validate strategy-specific parameters"""

    if params.strategy == "dca":
        if not isinstance(params.parameters, dict):
            raise LLMValidationError("DCA strategy missing parameters")

        if "amount_per_period" not in params.parameters:
            raise LLMValidationError("DCA requires 'amount_per_period'")

        if "frequency" not in params.parameters:
            raise LLMValidationError("DCA requires 'frequency'")

        valid_frequencies = {"daily", "weekly", "monthly"}
        freq = params.parameters.get("frequency")
        if freq not in valid_frequencies:
            raise LLMValidationError(
                f"DCA frequency must be one of: {', '.join(valid_frequencies)}"
            )

        amount = params.parameters.get("amount_per_period")
        if not isinstance(amount, (int, float, Decimal)) or amount <= 0:
            raise LLMValidationError("DCA amount_per_period must be positive")

    elif params.strategy == "va":
        if not isinstance(params.parameters, dict):
            raise LLMValidationError("VA strategy missing parameters")

        if "target_increment_amount" not in params.parameters:
            raise LLMValidationError("VA requires 'target_increment_amount'")

        amount = params.parameters.get("target_increment_amount")
        if not isinstance(amount, (int, float, Decimal)) or amount <= 0:
            raise LLMValidationError("VA target_increment_amount must be positive")

    elif params.strategy == "buy_and_hold":
        if params.parameters and params.parameters != {}:
            logger.warning("Buy and hold received unexpected parameters")
