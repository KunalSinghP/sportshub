from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from models import models
from routers import auth, communities, matches, ai, posts, predictions
from ws.manager import manager
import json
from fastapi.middleware.cors import CORSMiddleware
from seed import seed_database

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SportsHub API", version="1.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(communities.router)
app.include_router(matches.router)
app.include_router(ai.router)
app.include_router(posts.router)
app.include_router(predictions.router)

@app.websocket("/ws/match/{match_id}")
async def match_websocket_endpoint(websocket: WebSocket, match_id: int, db: Session = Depends(get_db)):
    # manager.connect() already calls await websocket.accept() internally
    await manager.connect(match_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()

            # Parse structural payload to store independently
            split_index = data.find(":")
            if split_index > -1:
                username = data[:split_index]
                text = data[split_index+1:].strip()
            else:
                username = "System" if data.startswith("System") else "User"
                text = data

            # Commit to database persistence
            new_msg = models.MatchMessage(match_id=match_id, username=username, text=text)
            db.add(new_msg)
            db.commit()

            # Broadcasting raw text as requested by frontend Option A
            await manager.broadcast_to_match(
                match_id,
                data
            )

    except WebSocketDisconnect:
        manager.disconnect(match_id, websocket)
        
@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"message": "Welcome to SportsHub API. Navigate to /docs for Swagger documentation."}

seed_database()

@app.on_event("startup")
def load_data():
    seed_database()