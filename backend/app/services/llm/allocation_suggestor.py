import json
from pathlib import Path

from fastapi import HTTPException
from openai import OpenAI, OpenAIError

from app.config.settings import settings
from app.logger import logger
from app.schemas.backtest import LLMPortfolioRebalance

MODULE_DIR = Path(__file__).parent

MAX_RETRIES = 2


class LLMValidationError(Exception):
    """Raised when LLM output fails validation"""

    pass


def suggest_portfolio_allocation(user_goals: str, allocation: dict) -> str | None:
    if not user_goals or not user_goals.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")

    for attempt in range(MAX_RETRIES):
        try:
            instructions, user_input = _load_instructions(user_goals, allocation)
            result = _call_llm(user_input, instructions)

            logger.info(
                f"Successfully generated portfolio allocation suggestion. Attempt {attempt + 1}",
            )

            return result

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


def _call_llm(user_input: str, instructions: str) -> str:
    client = OpenAI(api_key=settings.OPEN_AI_API_KEY)

    try:
        response = client.responses.parse(
            model="gpt-4.1-2025-04-14",
            input=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": user_input},
            ],
            text_format=LLMPortfolioRebalance,
        )

        result = response.output[0].content[0].text
        print(user_input)
        print(result)
        return result

    except Exception as e:
        logger.error(f"LLM parsing failed: {str(e)}")
        raise OpenAIError(f"Failed to parse LLM response: {str(e)}")


def _load_instructions(user_goals, allocation) -> tuple[str, str]:
    with open(MODULE_DIR / "prompts/rebalancing_analysis_instructions.txt", "r") as f:
        instructions = f.read()

    allocation_str = "\n".join(
        [f"{key}: {value * 100:.0f}%" for key, value in allocation.items()]
    )

    user_input = (
        f'Investor goals: "{user_goals}" \n\nCurrent Holdings.\n{allocation_str}'
    )

    return instructions, user_input
