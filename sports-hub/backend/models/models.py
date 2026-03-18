from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    predictions = relationship("Prediction", back_populates="user")

class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    
    posts = relationship("Post", back_populates="community")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    upvotes = Column(Integer, default=0)
    
    author_id = Column(Integer, ForeignKey("users.id"))
    community_id = Column(Integer, ForeignKey("communities.id"))
    
    author = relationship("User", back_populates="posts")
    community = relationship("Community", back_populates="posts")
    comments = relationship("Comment", back_populates="post")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))
    
    author = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    team1 = Column(String)
    team2 = Column(String)
    score_team1 = Column(Integer, default=0)
    score_team2 = Column(Integer, default=0)
    status = Column(String) # "upcoming", "live", "finished"
    start_time = Column(DateTime)
    
    predictions = relationship("Prediction", back_populates="match")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    predicted_winner = Column(String) # team1 or team2
    
    user_id = Column(Integer, ForeignKey("users.id"))
    match_id = Column(Integer, ForeignKey("matches.id"))
    
    user = relationship("User", back_populates="predictions")
    match = relationship("Match", back_populates="predictions")
