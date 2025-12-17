from app.database import get_db
from app.schemas.backtest import LLMBacktestParams
from app.services.llm import llm_service
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/llm", tags=["llm"])


@router.post("/parse_strategy", response_model=LLMBacktestParams)
def parse_strategy(
    user_input: str,
    db: Session = Depends(get_db),
) -> LLMBacktestParams:
    return llm_service.strategise_natural_language(user_input, db)
