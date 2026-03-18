from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class MatchBase(BaseModel):
    team1: str
    team2: str
    status: str
    start_time: datetime

class MatchCreate(MatchBase):
    pass

class Match(MatchBase):
    id: int
    score_team1: int
    score_team2: int
    
    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str
    content: str
    community_id: int

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    created_at: datetime
    upvotes: int
    author_id: int
    
    class Config:
        from_attributes = True

class PredictionBase(BaseModel):
    predicted_winner: str
    match_id: int

class PredictionCreate(PredictionBase):
    pass

class Prediction(PredictionBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str
    post_id: int

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    author_id: int
    
    class Config:
        from_attributes = True

class CommunityBase(BaseModel):
    name: str
    description: str

class CommunityCreate(CommunityBase):
    pass

class Community(CommunityBase):
    id: int
    
    class Config:
        from_attributes = True
