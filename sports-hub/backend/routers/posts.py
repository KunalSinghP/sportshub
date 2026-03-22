from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import models

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(models.Post).all()

    result = []
    for p in posts:
        result.append({
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "communityName": "Premier League",  # TEMP (replace later with join)
            "authorName": "user",
            "upvotes": 15,
            "commentCount": 0,
            "timeAgo": "Just now"
        })

    return result