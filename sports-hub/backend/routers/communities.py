from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import models
from schemas import schemas
from routers.auth import get_current_user, SECRET_KEY, ALGORITHM
from jose import jwt

router = APIRouter(
    prefix="/communities",
    tags=["Communities"]
)

def format_time_ago(dt: datetime) -> str:
    diff = datetime.utcnow() - dt
    seconds = diff.total_seconds()
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        return f"{int(seconds // 60)} minutes ago"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours ago"
    else:
        return f"{int(seconds // 86400)} days ago"

def format_post(post: models.Post) -> dict:
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "communityName": post.community.name if post.community else "Unknown",
        "authorName": post.author.username if post.author else "Deleted User",
        "upvotes": post.upvotes,
        "commentCount": len(post.comments) if post.comments else 0,
        "timeAgo": format_time_ago(post.created_at)
    }

@router.get("/", response_model=List[schemas.Community])
def read_communities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Community).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Community)
def create_community(community: schemas.CommunityCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if community already exists
    existing = db.query(models.Community).filter(models.Community.name == community.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Community name already taken")
    
    db_community = models.Community(**community.model_dump())
    db.add(db_community)
    
    # Automatically add the creator as a member
    db_community.members.append(current_user)
    
    db.commit()
    db.refresh(db_community)
    return db_community

from fastapi import Request
@router.get("/name/{name}", response_model=schemas.CommunityDetail)
def get_community_by_name(name: str, request: Request, db: Session = Depends(get_db)):
    # Try exact match first (handles communities saved with dashes like "my-cool-comm")
    comm = db.query(models.Community).filter(models.Community.name.ilike(name)).first()
    
    # If not found, try replacing dashes with spaces (handles seeded ones like "IPL Official")
    if not comm:
        formatted_name = name.replace("-", " ")
        comm = db.query(models.Community).filter(models.Community.name.ilike(formatted_name)).first()
    
    if not comm:
        raise HTTPException(status_code=404, detail="Community not found")
        
    is_member = False
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            if username:
                user = db.query(models.User).filter(models.User.username == username).first()
                if user and user in comm.members:
                    is_member = True
        except Exception:
            pass
            
    return {
        "id": comm.id,
        "name": comm.name,
        "description": comm.description,
        "member_count": len(comm.members),
        "is_member": is_member
    }

@router.post("/{community_id}/join")
def join_leave_community(community_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    comm = db.query(models.Community).filter(models.Community.id == community_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Community not found")
        
    try:
        if current_user in comm.members:
            comm.members.remove(current_user)
            action = "left"
        else:
            comm.members.append(current_user)
            action = "joined"
            
        db.commit()
        db.refresh(comm)
        return {"message": f"Successfully {action} community", "action": action, "member_count": len(comm.members)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{community_id}/posts", response_model=List[schemas.PostResponse])
def read_community_posts(community_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(models.Post).filter(models.Post.community_id == community_id).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return [format_post(p) for p in posts]

@router.post("/posts", response_model=schemas.PostResponse)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_post = models.Post(**post.model_dump(), author_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return format_post(db_post)

@router.get("/posts", response_model=List[schemas.PostResponse])
def read_all_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return [format_post(p) for p in posts]
