from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import models
from routers import auth, communities, matches, ai, posts
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

@app.websocket("/ws/match/{match_id}")
async def match_websocket_endpoint(websocket: WebSocket, match_id: int):
    await manager.connect(match_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Simple echo broadcast for MVP chat
            msg_payload = {"user": "User", "text": data}
            await manager.broadcast_to_match(match_id, json.dumps(msg_payload))
    except WebSocketDisconnect:
        manager.disconnect(match_id, websocket)

@app.get("/")
def read_root():
    return {"message": "Welcome to SportsHub API. Navigate to /docs for Swagger documentation."}

seed_database()

@app.on_event("startup")
def load_data():
    seed_database()