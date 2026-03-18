from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import models
from schemas import schemas
from routers.auth import get_current_user

router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)

@router.get("/", response_model=List[schemas.Match])
def read_matches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Match).offset(skip).limit(limit).all()

@router.get("/{match_id}", response_model=schemas.Match)
def read_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match

@router.post("/", response_model=schemas.Match)
def create_match(match: schemas.MatchCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_match = models.Match(**match.model_dump())
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.post("/{match_id}/predict", response_model=schemas.Prediction)
def create_prediction(match_id: int, prediction_team: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    db_prediction = models.Prediction(
        predicted_winner=prediction_team,
        user_id=current_user.id,
        match_id=match.id
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction
