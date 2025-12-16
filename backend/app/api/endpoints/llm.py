from app.schemas.backtest import LLMBacktestParams
from app.services.llm import llm_service
from fastapi import APIRouter

router = APIRouter(prefix="/llm", tags=["llm"])


@router.post("/parse_strategy", response_model=LLMBacktestParams)
def parse_strategy(user_input: str) -> LLMBacktestParams:
    return llm_service.strategise_natural_language(user_input)
