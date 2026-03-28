from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import models
from schemas import schemas
from routers.communities import format_post, format_time_ago
from pydantic import BaseModel
from routers.auth import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])

class UpvoteAction(BaseModel):
    action: str

@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return [format_post(p) for p in posts]

@router.get("/{post_id}", response_model=schemas.PostDetailResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    formatted = format_post(post)
    comments = []
    for comment in post.comments:
        comments.append(schemas.CommentResponse(
            id=comment.id,
            content=comment.content,
            authorName=comment.author.username if comment.author else "Deleted User",
            timeAgo=format_time_ago(comment.created_at)
        ))
    
    return schemas.PostDetailResponse(**formatted, comments=comments)

@router.post("/{post_id}/upvote")
def toggle_upvote(post_id: int, payload: UpvoteAction, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if payload.action == "up":
        post.upvotes += 1
    elif payload.action == "down":
        post.upvotes -= 1
        
    db.commit()
    db.refresh(post)
    return {"upvotes": post.upvotes}

class CommentInput(BaseModel):
    content: str

@router.post("/{post_id}/comments", response_model=schemas.CommentResponse)
def add_comment(post_id: int, payload: CommentInput, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    db_comment = models.Comment(
        content=payload.content,
        post_id=post_id,
        author_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return schemas.CommentResponse(
        id=db_comment.id,
        content=db_comment.content,
        authorName=current_user.username,
        timeAgo="Just now"
    )