# app/api/api_v1/endpoints/watchlist.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app import schemas, crud
from app.config.database import get_db

router = APIRouter()


@router.post("/", response_model=schemas.Watchlist)
def add_to_watchlist(watchlist: schemas.Watchlist, db: Session = Depends(get_db)):
    """Add a stock symbol to a user's watchlist."""
    return crud.add_to_watchlist(db=db, watchlist=watchlist)


# @router.get("/{user_id}", response_model=list[schemas.Watchlist])
# def read_watchlist(user_id: int, db: Session = Depends(get_db)):
#     """Get all watchlist for a user"""
#     db_watchlist = crud.get_watchlist_by_user(db, user_id=user_id)
#     if not db_watchlist:
#         raise HTTPException(status_code=404, detail="No watchlists found for user")
#     return db_watchlist
#
#
# @router.delete("/{watchlist_id}", response_model=schemas.Watchlist)
# def delete_watchlist(watchlist_id: int, db: Session = Depends(get_db)):
#     """Delete a watchlist by ID"""
#     watchlist = crud.get_watchlist(db, watchlist_id=watchlist_id)
#     if watchlist is None:
#         raise HTTPException(status_code=404, detail="Watchlist not found")
#     return crud.delete_watchlist(db=db, watchlist_id=watchlist_id)
