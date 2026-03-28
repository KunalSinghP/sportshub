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

class PredictionGuestCreate(BaseModel):
    match_id: int
    user_id: str
    username: str
    predicted_winner: str

class Prediction(BaseModel):
    id: int
    match_id: int
    user_id: str
    username: str
    predicted_winner: str
    is_correct: Optional[bool] = None
    
    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    username: str
    total_predictions: int
    correct_predictions: int
    accuracy: float

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

class MatchMessageBase(BaseModel):
    username: str
    text: str

class MatchMessageCreate(MatchMessageBase):
    pass

class MatchMessage(MatchMessageBase):
    id: int
    match_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CommunityDetail(CommunityBase):
    id: int
    member_count: int
    is_member: bool = False
    
    class Config:
        from_attributes = True

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    communityName: str
    authorName: str
    upvotes: int
    commentCount: int
    timeAgo: str
    
    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    id: int
    content: str
    authorName: str
    timeAgo: str
    
    class Config:
        from_attributes = True

class PostDetailResponse(PostResponse):
    comments: List[CommentResponse] = []
    
    class Config:
        from_attributes = True
