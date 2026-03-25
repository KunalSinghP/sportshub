from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from models import models
from schemas import schemas

router = APIRouter(
    tags=["Predictions"]
)

@router.post("/predict", response_model=schemas.Prediction)
def create_prediction(prediction: schemas.PredictionGuestCreate, db: Session = Depends(get_db)):
    # Check if match exists
    match = db.query(models.Match).filter(models.Match.id == prediction.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    # Check if prediction exists for this user and match
    existing_prediction = db.query(models.Prediction).filter(
        models.Prediction.match_id == prediction.match_id,
        models.Prediction.user_id == prediction.user_id
    ).first()
    
    if existing_prediction:
        # Do not allow user to change prediction once already chosen
        raise HTTPException(status_code=400, detail="You have already cast a prediction for this match.")
    else:
        # Create new prediction
        db_prediction = models.Prediction(
            match_id=prediction.match_id,
            user_id=prediction.user_id,
            username=prediction.username,
            predicted_winner=prediction.predicted_winner
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        return db_prediction

@router.post("/resolve_match")
def resolve_match(match_id: int, winner: str, db: Session = Depends(get_db)):
    """
    Manually resolve a match by providing the winner's team name.
    """
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    predictions = db.query(models.Prediction).filter(models.Prediction.match_id == match_id).all()
    
    for p in predictions:
        p.is_correct = (p.predicted_winner == winner)
        
    db.commit()
    return {"message": f"Resolved match {match_id} with winner {winner}"}

@router.get("/leaderboard", response_model=List[schemas.LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    predictions = db.query(models.Prediction).all()
    
    # Calculate stats
    # Group by username
    user_stats = {}
    for p in predictions:
        if p.is_correct is None:
            continue
        
        username = p.username
        if username not in user_stats:
            user_stats[username] = {"total": 0, "correct": 0}
            
        user_stats[username]["total"] += 1
        if p.is_correct:
            user_stats[username]["correct"] += 1
            
    # Format to leaderboard entries
    leaderboard = []
    for username, stats in user_stats.items():
        total = stats["total"]
        correct = stats["correct"]
        accuracy = round((correct / total) * 100, 1) if total > 0 else 0.0
        
        leaderboard.append({
            "username": username,
            "total_predictions": total,
            "correct_predictions": correct,
            "accuracy": accuracy
        })
        
    # Sort descending by accuracy, then by total predictions
    leaderboard.sort(key=lambda x: (x["accuracy"], x["total_predictions"]), reverse=True)
    
    return leaderboard
