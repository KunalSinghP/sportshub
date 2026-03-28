from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

community_members = Table(
    "community_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("community_id", Integer, ForeignKey("communities.id"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    joined_communities = relationship("Community", secondary=community_members, back_populates="members")

class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    
    posts = relationship("Post", back_populates="community")
    members = relationship("User", secondary=community_members, back_populates="joined_communities")

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
    match_id = Column(Integer, ForeignKey("matches.id"))
    user_id = Column(String)
    username = Column(String)
    predicted_winner = Column(String) # team1 or team2
    is_correct = Column(Boolean, default=None)
    
    match = relationship("Match", back_populates="predictions")

class MatchMessage(Base):
    __tablename__ = "match_messages"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    username = Column(String)
    text = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    match = relationship("Match")
