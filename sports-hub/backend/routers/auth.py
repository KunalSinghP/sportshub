from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
#from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os

from database import get_db
from models import models
from schemas import schemas

# Security Constants
SECRET_KEY = "your-super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

#pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Helpers
def verify_password(plain_password, hashed_password):
    return plain_password == hashed_password

def get_password_hash(password: str):
    return password  # TEMP FIX

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency for current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/me/profile")
def get_user_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    predictions = db.query(models.Prediction).filter(models.Prediction.user_id == current_user.id).all()
    total_picks = len(predictions)
    
    correct = 0
    resolved = 0
    ui_predictions = []
    
    for p in predictions:
        match = db.query(models.Match).filter(models.Match.id == p.match_id).first()
        match_title = f"{match.team1} vs {match.team2}" if match else "Unknown Match"
        result_text = "Pending"
        
        if match and match.status == "finished":
            resolved += 1
            won_match = match.team1 if match.score_team1 > match.score_team2 else match.team2
            is_tie = match.score_team1 == match.score_team2
            
            if is_tie:
                result_text = "TIE"
            elif p.predicted_winner == won_match:
                correct += 1
                result_text = "WIN"
            else:
                result_text = "LOSS"
                
        ui_predictions.append({
            "id": p.id,
            "match_title": match_title,
            "predicted_winner": p.predicted_winner,
            "result": result_text if match else "Unknown"
        })
        
    accuracy = (correct / resolved * 100) if resolved > 0 else 0.0
    
    posts = db.query(models.Post).filter(models.Post.author_id == current_user.id).all()
    ui_posts = []
    for post in posts:
        community = db.query(models.Community).filter(models.Community.id == post.community_id).first()
        comment_count = db.query(models.Comment).filter(models.Comment.post_id == post.id).count()
        ui_posts.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "authorName": current_user.username,
            "communityName": community.name if community else "General",
            "upvotes": post.upvotes,
            "commentCount": comment_count,
            "timeAgo": post.created_at.strftime("%b %d, %Y") if hasattr(post, "created_at") and post.created_at else "Recently"
        })
        
    return {
        "username": current_user.username,
        "joined": "August 2025",
        "accuracy": round(accuracy, 1),
        "rank": 1,
        "totalPicks": total_picks,
        "posts": ui_posts,
        "predictions": ui_predictions
    }
