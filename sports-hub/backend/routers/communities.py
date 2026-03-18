from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import models
from schemas import schemas
from routers.auth import get_current_user

router = APIRouter(
    prefix="/communities",
    tags=["Communities"]
)

@router.get("/", response_model=List[schemas.Community])
def read_communities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Community).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Community)
def create_community(community: schemas.CommunityCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_community = models.Community(**community.model_dump())
    db.add(db_community)
    db.commit()
    db.refresh(db_community)
    return db_community

@router.get("/{community_id}/posts", response_model=List[schemas.Post])
def read_community_posts(community_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Post).filter(models.Post.community_id == community_id).offset(skip).limit(limit).all()

@router.post("/posts", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_post = models.Post(**post.model_dump(), author_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/posts", response_model=List[schemas.Post])
def read_all_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
