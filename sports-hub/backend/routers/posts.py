from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(models.Post).all()
    return posts